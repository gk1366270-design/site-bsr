/**
 * Live Timing Page - Nova Implementação
 * 
 * Esta página exibe os dados de timing em tempo real recebidos do Assetto Corsa
 * via WebSocket. Segue o fluxo:
 * 
 * Assetto Corsa Server (UDP) -> Node.js Backend -> WebSocket -> Frontend
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Driver, LiveTimingData } from '@/types/timingTypes';
import liveTimingService from '@/services/liveTimingService';

export default function LiveTiming() {
  const [timingData, setTimingData] = useState<LiveTimingData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Conectar ao serviço de Live Timing
    liveTimingService.connect();

    // Adicionar listener para receber atualizações
    const unsubscribe = liveTimingService.addDataListener((data: LiveTimingData) => {
      setTimingData(data);
      setConnectionStatus('connected');
    });

    // Atualizar status de conexão
    const interval = setInterval(() => {
      setConnectionStatus(liveTimingService.getConnectionStatus());
    }, 1000);

    // Verificar status de admin
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();

    return () => {
      unsubscribe();
      clearInterval(interval);
      liveTimingService.disconnect();
    };
  }, []);

  const formatTime = (time: string) => {
    if (!time || time === '0:00.000') return '--';
    return time;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'default';
      case 'in pit':
      case 'in pit lane':
        return 'secondary';
      case 'in garage':
        return 'outline';
      case 'disconnected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Timing</h1>
        
        <div className="flex items-center gap-4">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {connectionStatus === 'connected' && timingData && timingData.drivers.length > 0 ? (
        <div className="space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Sessão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Session Type</p>
                  <p className="font-semibold">{timingData.sessionInfo.sessionType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">{timingData.sessionStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Time</p>
                  <p className="font-semibold">{timingData.sessionInfo.remainingTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Laps</p>
                  <p className="font-semibold">{timingData.sessionInfo.totalLaps}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Track Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Condições da Pista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Track Temp</p>
                  <p className="font-semibold">{timingData.trackConditions.trackTemp}°C</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Air Temp</p>
                  <p className="font-semibold">{timingData.trackConditions.airTemp}°C</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="font-semibold">{timingData.trackConditions.humidity}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="font-semibold">{timingData.trackConditions.windSpeed} km/h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wind Direction</p>
                  <p className="font-semibold">{timingData.trackConditions.windDirection}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drivers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pilotos ({timingData.drivers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Pos</TableHead>
                      <TableHead className="w-[80px]">Nº</TableHead>
                      <TableHead>Piloto</TableHead>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Carro</TableHead>
                      <TableHead className="w-[60px]">Volta</TableHead>
                      <TableHead className="w-[100px]">Tempo</TableHead>
                      <TableHead className="w-[80px]">Gap</TableHead>
                      <TableHead className="w-[100px]">Última Volta</TableHead>
                      <TableHead className="w-[100px]">Melhor Volta</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timingData.drivers.map((driver: Driver) => (
                      <TableRow key={`${driver.position}-${driver.number}`}>
                        <TableCell>{driver.position}</TableCell>
                        <TableCell>{driver.number}</TableCell>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.team}</TableCell>
                        <TableCell>{driver.car}</TableCell>
                        <TableCell>{driver.lap}</TableCell>
                        <TableCell>{formatTime(driver.time)}</TableCell>
                        <TableCell>{driver.gap}</TableCell>
                        <TableCell>{formatTime(driver.lastLap)}</TableCell>
                        <TableCell>{formatTime(driver.bestLap)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(driver.status)}>
                            {driver.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-right text-sm text-muted-foreground">
            Last updated: {new Date(timingData.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4 text-destructive">SERVIDOR NÃO CONECTADO</h3>
            <p className="text-muted-foreground mb-4">
              {connectionStatus === 'connected'
                ? 'Conectado ao servidor Assetto Corsa, aguardando dados da corrida...'
                : 'Não foi possível conectar ao servidor Assetto Corsa.'}
            </p>
            {connectionStatus !== 'connected' && (
              <p className="text-sm text-muted-foreground">
                Verifique se o Assetto Corsa Dedicated Server está rodando com UDP habilitado.
              </p>
            )}
            <div className="mt-6">
              <Badge variant="destructive" className="text-sm">
                Status: {connectionStatus === 'connected' ? 'Conectado (sem dados)' : 'Desconectado'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}