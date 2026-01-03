import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, MapPin, Flag, Target, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import liveTimingService from '@/services/liveTimingService';
import { Driver, LiveTimingData } from '@/types/timingTypes';

interface TrackMapProps {
  trackName: string;
  onDriverSelect?: (driverId: number) => void;
}

const TrackMap = ({ trackName, onDriverSelect }: TrackMapProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trackMap, setTrackMap] = useState<{
    trackImage: string;
    sectors: Array<{
      sectorNumber: number;
      startPosition: { x: number; y: number };
      endPosition: { x: number; y: number };
    }>;
    startFinishPosition: { x: number; y: number };
    pitLanePosition: { x: number; y: number };
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Conectar ao serviço de Live Timing
    liveTimingService.connect();
    
    // Adicionar listener para receber atualizações
    const unsubscribe = liveTimingService.addDataListener((data: LiveTimingData) => {
      if (data.drivers) {
        setDrivers(data.drivers);
      }
    });
    
    // Atualizar status de conexão
    const statusInterval = setInterval(() => {
      setConnectionStatus(liveTimingService.getConnectionStatus());
    }, 1000);
    
    return () => {
      unsubscribe();
      clearInterval(statusInterval);
      liveTimingService.disconnect();
    };
  }, [trackName]);

  const handleDriverClick = (driverId: number) => {
    setSelectedDriver(driverId);
    if (onDriverSelect) {
      onDriverSelect(driverId);
    }
  };

  const toggleFullscreen = () => {
    if (!mapRef.current) return;
    
    if (!isFullscreen) {
      if (mapRef.current.requestFullscreen) {
        mapRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado ao Assetto Corsa';
      case 'connecting': return 'Conectando...';
      case 'closed': return 'Desconectado';
      default: return 'Status desconhecido';
    }
  };

  const loadTrackData = () => {
    // Center the track map by resetting zoom and position
    setZoomLevel(1);
    // Additional logic to load or center track data can be added here
    console.log('Centralizing track map');
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa da Pista - {trackName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getConnectionStatusColor()}`}>
            <span className="w-2 h-2 rounded-full bg-white/50"></span>
            <span>{getConnectionStatusText()}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(z => Math.min(z + 0.2, 2))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.5))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadTrackData}>
              <Target className="h-4 w-4 mr-2" />
              Centralizar
            </Button>
          </div>
          
          {/* Track Map Container */}
          <div
            ref={mapRef}
            className="relative w-full h-96 bg-muted/20 rounded-lg overflow-hidden border border-border/50"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
          >
            {/* Track Background */}
            {trackMap ? (
              <img
                src={trackMap.trackImage}
                alt={trackName}
                className="w-full h-full object-cover opacity-30"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-background/50 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Carregando mapa da pista...</p>
                </div>
              </div>
            )}
            
            {/* Track Layout */}
            {trackMap && (
              <svg className="absolute inset-0 w-full h-full">
                {/* Track Outline */}
                <path
                  d="M 10% 50% Q 50% 10% 90% 50% Q 50% 90% 10% 50%"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  opacity="0.3"
                />
                
                {/* Sectors */}
                {trackMap.sectors.map((sector: {
                  sectorNumber: number;
                  startPosition: { x: number; y: number };
                  endPosition: { x: number; y: number };
                }) => (
                  <g key={sector.sectorNumber}>
                    <line
                      x1={`${sector.startPosition.x * 100}%`}
                      y1={`${sector.startPosition.y * 100}%`}
                      x2={`${sector.endPosition.x * 100}%`}
                      y2={`${sector.endPosition.y * 100}%`}
                      stroke="hsl(var(--secondary))"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                    <circle
                      cx={`${sector.startPosition.x * 100}%`}
                      cy={`${sector.startPosition.y * 100}%`}
                      r="4"
                      fill="hsl(var(--secondary))"
                    />
                    <text
                      x={`${sector.startPosition.x * 100}%`}
                      y={`${sector.startPosition.y * 100}%`}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      dy="-10"
                    >
                      Setor {sector.sectorNumber}
                    </text>
                  </g>
                ))}
                
                {/* Start/Finish Line */}
                <line
                  x1={`${trackMap.startFinishPosition.x * 100}%`}
                  y1="10%"
                  x2={`${trackMap.startFinishPosition.x * 100}%`}
                  y2="20%"
                  stroke="hsl(var(--destructive))"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
                <text
                  x={`${trackMap.startFinishPosition.x * 100}%`}
                  y="15%"
                  textAnchor="middle"
                  fill="hsl(var(--destructive))"
                  fontSize="12"
                  fontWeight="bold"
                >
                  START/FINISH
                </text>
                
                {/* Pit Lane */}
                <rect
                  x={`${trackMap.pitLanePosition.x * 100 - 5}%`}
                  y="85%"
                  width="10%"
                  height="10%"
                  fill="hsl(var(--muted))"
                  opacity="0.5"
                />
                <text
                  x={`${trackMap.pitLanePosition.x * 100}%`}
                  y="90%"
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  Pit Lane
                </text>
              </svg>
            )}
            
            {/* Driver Positions */}
            {drivers.map((driver) => (
              <div
                key={driver.carId}
                className="absolute cursor-pointer hover:scale-125 transition-transform"
                style={{
                  left: `${driver.positionX + 50}%`,
                  top: `${driver.positionY + 50}%`,
                  transform: `translate(-50%, -50%) rotate(${driver.steeringAngle * 20}deg)`
                }}
                onClick={() => handleDriverClick(driver.carId)}
              >
                <div className="relative">
                  {/* Car Icon */}
                  <div className={`w-8 h-6 bg-${driver.carId % 6 === 0 ? 'red' : driver.carId % 6 === 1 ? 'blue' : driver.carId % 6 === 2 ? 'green' : driver.carId % 6 === 3 ? 'yellow' : driver.carId % 6 === 4 ? 'purple' : 'orange'}-500 rounded-sm flex items-center justify-center`}>
                    <Car className="w-4 h-4 text-white transform -rotate-90" />
                  </div>
                  
                  {/* Driver Info Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="font-semibold">{driver.number} - {driver.name}</div>
                    <div className="text-muted-foreground">Lap {driver.lap} - {driver.speed.toFixed(0)} km/h</div>
                  </div>
                  
                  {/* Position Number */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center text-xs font-bold">
                    {driver.position}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Selected Driver Info */}
            {selectedDriver !== null && (
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 max-w-xs">
                {drivers.map(driver => driver.carId === selectedDriver && (
                  <div key={driver.carId} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-4 bg-${driver.carId % 6 === 0 ? 'red' : driver.carId % 6 === 1 ? 'blue' : driver.carId % 6 === 2 ? 'green' : driver.carId % 6 === 3 ? 'yellow' : driver.carId % 6 === 4 ? 'purple' : 'orange'}-500 rounded-sm`}></div>
                      <div>
                        <div className="font-semibold text-sm">{driver.number} - {driver.name}</div>
                        <div className="text-xs text-muted-foreground">{driver.team}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Posição</div>
                        <div className="font-bold">{driver.position}º</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Volta</div>
                        <div className="font-bold">{driver.lap}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Velocidade</div>
                        <div className="font-bold">{driver.speed.toFixed(0)} km/h</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">RPM</div>
                        <div className="font-bold">{driver.rpm.toFixed(0)}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setSelectedDriver(null)}
                    >
                      Fechar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Driver Legend */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Pilotos na Pista ({drivers.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {drivers.slice(0, 6).map((driver) => (
                <div
                  key={driver.carId}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${selectedDriver === driver.carId ? 'bg-primary/10 border border-primary' : ''}`}
                  onClick={() => handleDriverClick(driver.carId)}
                >
                  <div className={`w-4 h-3 bg-${driver.carId % 6 === 0 ? 'red' : driver.carId % 6 === 1 ? 'blue' : driver.carId % 6 === 2 ? 'green' : driver.carId % 6 === 3 ? 'yellow' : driver.carId % 6 === 4 ? 'purple' : 'orange'}-500 rounded-sm`}></div>
                  <div>
                    <div className="font-medium">{driver.number}</div>
                    <div className="text-muted-foreground truncate max-w-[100px]">{driver.name}</div>
                  </div>
                  <div className="ml-auto font-bold">{driver.position}º</div>
                </div>
              ))}
              {drivers.length > 6 && (
                <div className="flex items-center justify-center p-2 text-muted-foreground">
                  +{drivers.length - 6} mais
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackMap;