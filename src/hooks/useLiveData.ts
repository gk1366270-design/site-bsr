/**
 * useLiveData Hook
 * 
 * Hook customizado para facilitar acesso aos dados de live timing
 * Combina WebSocket e HTTP polling para máxima confiabilidade
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveTimingData } from '@/types/timingTypes';
import { getConfig } from '@/config/liveTimingConfig';

interface UseLiveDataOptions {
  raceId?: number;
  autoStart?: boolean;
  useWebSocket?: boolean;
  usePolling?: boolean;
}

interface UseLiveDataReturn {
  data: LiveTimingData | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  refresh: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Hook para gerenciar dados de live timing
 * 
 * @example
 * const { data, loading, isConnected } = useLiveData({ raceId: 1 });
 * 
 * return (
 *   <>
 *     {loading && <Loading />}
 *     {isConnected && <LiveData drivers={data?.drivers} />}
 *     {!isConnected && <Offline />}
 *   </>
 * );
 */
export const useLiveData = ({
  raceId = 1,
  autoStart = true,
  useWebSocket = true,
  usePolling = true,
}: UseLiveDataOptions = {}): UseLiveDataReturn => {
  const [data, setData] = useState<LiveTimingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Construir URL do WebSocket
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const path = getConfig('websocket.path', '/live-timing-ws');
    return `${protocol}//${hostname}:${port}${path}`;
  }, []);

  // Conectar via WebSocket
  const connectWebSocket = useCallback(() => {
    if (!useWebSocket || wsRef.current) return;

    setConnectionStatus('connecting');
    
    try {
      const wsUrl = getWebSocketUrl();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Enviar mensagem de subscribe (opcional)
        wsRef.current?.send(JSON.stringify({
          type: 'SUBSCRIBE',
          raceId: raceId
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'LIVE_UPDATE' && message.data) {
            setData(message.data);
            setLastUpdated(new Date().toISOString());
            setLoading(false);
          }
        } catch (err) {
          console.error('❌ Erro ao parsear mensagem WebSocket:', err);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('❌ Erro WebSocket:', err);
        setConnectionStatus('error');
        setError('Erro de conexão WebSocket');
      };

      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        wsRef.current = null;

        // Tentar reconectar
        attemptReconnect();

        // Fallback para polling se disponível
        if (usePolling) {
          connectPolling();
        }
      };
    } catch (err) {
      console.error('❌ Erro ao conectar WebSocket:', err);
      setConnectionStatus('error');
      setError('Falha ao conectar via WebSocket');
      
      if (usePolling) {
        connectPolling();
      }
    }
  }, [useWebSocket, raceId, getWebSocketUrl, usePolling]);

  // Conectar via HTTP polling (fallback)
  const connectPolling = useCallback(() => {
    if (!usePolling) return;

    // Limpar polling anterior se existir
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    const pollInterval = getConfig('http.pollInterval', 5000);

    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const endpoint = getConfig('http.endpoint', '/live-timing');
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const liveData = await response.json();
          setData(liveData);
          setLastUpdated(new Date().toISOString());
          setLoading(false);
          setError(null);
          setIsConnected(true);
          
          if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
            setConnectionStatus('connected');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        console.error('❌ Erro ao fazer polling:', err);
        setLoading(false);
        setError(`Erro ao buscar dados: ${err}`);
        setIsConnected(false);
        setConnectionStatus('error');
      }
    };

    // Fetch imediato
    fetchLiveData();

    // Setup polling
    pollIntervalRef.current = setInterval(fetchLiveData, pollInterval);
  }, [usePolling, connectionStatus]);

  // Tentar reconectar
  const attemptReconnect = useCallback(() => {
    const maxAttempts = getConfig('websocket.maxReconnectAttempts', 5);
    const reconnectInterval = getConfig('websocket.reconnectInterval', 3000);

    if (reconnectAttemptsRef.current >= maxAttempts) {
      console.log('⚠️ Máximo de tentativas de reconexão atingido');
      return;
    }

    reconnectAttemptsRef.current++;
    console.log(`🔄 Tentativa de reconexão ${reconnectAttemptsRef.current}/${maxAttempts}`);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, reconnectInterval);
  }, [connectWebSocket]);

  // Desconectar
  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando...');
    
    // Fechar WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Limpar polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Limpar timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setData(null);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Refresh manual
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing dados...');
    setLoading(true);
    
    try {
      const endpoint = getConfig('http.endpoint', '/live-timing');
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const liveData = await response.json();
        setData(liveData);
        setLastUpdated(new Date().toISOString());
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Erro ao fazer refresh:', err);
      setError(`Erro ao fazer refresh: ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup inicial
  useEffect(() => {
    if (!autoStart) return;

    // Preferência: WebSocket > Polling
    if (useWebSocket) {
      connectWebSocket();
    } else if (usePolling) {
      connectPolling();
    }

    return () => {
      disconnect();
    };
  }, [autoStart, useWebSocket, usePolling, connectWebSocket, connectPolling, disconnect]);

  return {
    data,
    loading,
    error,
    isConnected,
    lastUpdated,
    connectionStatus,
    refresh,
    disconnect,
  };
};

export default useLiveData;
