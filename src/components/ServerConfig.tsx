import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Server, Wifi, AlertTriangle, CheckCircle, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServerConfigProps {
  onConnect: (serverUrl: string) => void;
  connectionStatus: string;
  currentServer?: string;
}

const ServerConfig = ({ onConnect, connectionStatus, currentServer }: ServerConfigProps) => {
  const [serverUrl, setServerUrl] = useState(currentServer || 'wss://brasilsimracing.discloud.app');
  const [protocol, setProtocol] = useState('wss');
  const [hostname, setHostname] = useState('brasilsimracing.discloud.app');
  const [port, setPort] = useState('443');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Parse current server URL if provided
    if (currentServer) {
      try {
        const url = new URL(currentServer.replace('ws://', 'http://').replace('wss://', 'https://'));
        setProtocol(url.protocol.replace('http', 'ws'));
        setHostname(url.hostname);
        setPort(url.port || (url.protocol === 'wss:' ? '443' : '80'));
        setServerUrl(currentServer);
      } catch (error) {
        console.error('Invalid server URL:', error);
      }
    }
  }, [currentServer]);

  const handleConnect = () => {
    if (!serverUrl) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe o endereço do servidor',
        variant: 'destructive',
      });
      return;
    }

    onConnect(serverUrl);
    
    toast({
      title: 'Conectando',
      description: `Tentando conectar a ${serverUrl}`,
      variant: 'default',
    });
  };

  const handleProtocolChange = (value: string) => {
    setProtocol(value);
    updateServerUrl(value, hostname, port);
  };

  const handleHostnameChange = (value: string) => {
    setHostname(value);
    updateServerUrl(protocol, value, port);
  };

  const handlePortChange = (value: string) => {
    setPort(value);
    updateServerUrl(protocol, hostname, value);
  };

  const updateServerUrl = (proto: string, host: string, prt: string) => {
    const url = `${proto}://${host}${prt ? ':' + prt : ''}`;
    setServerUrl(url);
  };

  const handleReset = () => {
    setProtocol('wss');
    setHostname('brasilsimracing.discloud.app');
    setPort('443');
    setServerUrl('wss://brasilsimracing.discloud.app');
  };

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'Conectado ao servidor',
          description: 'Recebendo dados em tempo real'
        };
      case 'connecting':
        return {
          icon: <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />,
          text: 'Conectando...',
          description: 'Aguardando conexão com o servidor'
        };
      case 'closed':
      case 'disconnected':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          text: 'Desconectado',
          description: 'Não está recebendo dados em tempo real'
        };
      default:
        return {
          icon: <Server className="h-4 w-4 text-muted-foreground" />,
          text: 'Status desconhecido',
          description: 'Verifique a conexão'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5" />
          Configuração do Servidor Assetto Corsa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          {statusInfo.icon}
          <div>
            <div className="font-medium">{statusInfo.text}</div>
            <div className="text-sm text-muted-foreground">{statusInfo.description}</div>
          </div>
        </div>

        {/* Basic Configuration */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="server-url">Endereço do Servidor</Label>
              <div className="flex gap-2">
                <Input
                  id="server-url"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="wss://brasilsimracing.discloud.app"
                  className="flex-1"
                />
                <Button size="sm" onClick={handleConnect}>
                  <Wifi className="h-4 w-4 mr-2" />
                  Conectar
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocolo</Label>
                  <Select value={protocol} onValueChange={handleProtocolChange}>
                    <SelectTrigger id="protocol">
                      <SelectValue placeholder="Selecione protocolo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ws">WS (WebSocket)</SelectItem>
                      <SelectItem value="wss">WSS (WebSocket Seguro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hostname">Hostname/IP</Label>
                  <Input
                    id="hostname"
                    value={hostname}
                    onChange={(e) => handleHostnameChange(e.target.value)}
                    placeholder="brasilsimracing.discloud.app"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    value={port}
                    onChange={(e) => handlePortChange(e.target.value)}
                    placeholder="9000"
                    type="number"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Common Server Addresses */}
        <div className="space-y-2">
          <Label>Endereços Comuns</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProtocol('wss');
                setHostname('brasilsimracing.discloud.app');
                setPort('443');
                setServerUrl('wss://brasilsimracing.discloud.app');
              }}
            >
              Discloud (Prod)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProtocol('ws');
                setHostname('localhost');
                setPort('9000');
                setServerUrl('ws://localhost:9000');
              }}
            >
              Localhost:9000
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProtocol('ws');
                setHostname('127.0.0.1');
                setPort('9000');
                setServerUrl('ws://127.0.0.1:9000');
              }}
            >
              127.0.0.1:9000
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProtocol('wss');
                setHostname('br.assettohosting.com');
                setPort('10095');
                setServerUrl('wss://br.assettohosting.com:10095');
              }}
            >
              Assetto Hosting
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Configuração Avançada
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button size="sm" onClick={handleConnect}>
            <Save className="h-4 w-4 mr-2" />
            Salvar e Conectar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServerConfig;