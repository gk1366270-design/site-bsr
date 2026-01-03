/**
 * Live Timing Service - Frontend
 * 
 * Este serviço gerencia a conexão WebSocket com o backend
 * e fornece os dados de timing para os componentes React.
 */

import { Driver, LiveTimingData } from '@/types/timingTypes';

class LiveTimingService {
  private static instance: LiveTimingService;
  private dataCache: LiveTimingData | null;
  private listeners: Array<(data: LiveTimingData) => void>;
  private ws: WebSocket | null;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private reconnectTimeout: NodeJS.Timeout | null;

  private constructor() {
    this.dataCache = null;
    this.listeners = [];
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  public static getInstance(): LiveTimingService {
    if (!LiveTimingService.instance) {
      LiveTimingService.instance = new LiveTimingService();
    }
    return LiveTimingService.instance;
  }

  /**
   * Conecta ao WebSocket do backend
   */
  public connect(): void {
    // Conectar ao WebSocket do backend (Node.js)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const wsUrl = `${protocol}//${hostname}:${port}/live-timing-ws`;

    console.log('Connecting to Live Timing WebSocket:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected to backend');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'LIVE_UPDATE' && data.data) {
          this.dataCache = data.data;
          this.notifyListeners(data.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Tenta reconectar ao WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  /**
   * Desconecta do WebSocket
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
  }

  /**
   * Adiciona um listener para receber atualizações de dados
   */
  public addDataListener(listener: (data: LiveTimingData) => void): () => void {
    this.listeners.push(listener);
    
    // Se já tiver dados, enviar imediatamente
    if (this.dataCache) {
      listener(this.dataCache);
    }

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifica todos os listeners com novos dados
   */
  private notifyListeners(data: LiveTimingData): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in listener:', error);
      }
    });
  }

  /**
   * Retorna os dados atuais em cache
   */
  public getCurrentData(): LiveTimingData | null {
    return this.dataCache;
  }

  /**
   * Verifica se está conectado
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Retorna o status da conexão
   */
  public getConnectionStatus(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}

// Singleton para fácil acesso
export default LiveTimingService.getInstance();