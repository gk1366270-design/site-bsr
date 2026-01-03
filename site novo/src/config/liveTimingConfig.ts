/**
 * Live Timing Configuration
 * 
 * Arquivo de configuração centralizado para o sistema de live timing
 * do Assetto Corsa no site Brasil Sim Racing
 */

export const LiveTimingConfig = {
  // WebSocket configuration
  websocket: {
    // Caminho do endpoint WebSocket
    path: '/live-timing-ws',
    
    // Intervalo de reconexão em ms (exponencial backoff)
    reconnectInterval: 3000,
    
    // Número máximo de tentativas de reconexão
    maxReconnectAttempts: 5,
    
    // Timeout para considerar conexão como morta (em ms)
    connectionTimeout: 10000,
  },

  // HTTP polling configuration (fallback)
  http: {
    // Endpoint HTTP de polling
    endpoint: '/live-timing',
    
    // Intervalo de polling em ms (quando WebSocket não está disponível)
    pollInterval: 5000,
    
    // Timeout para requisição HTTP (em ms)
    timeout: 5000,
  },

  // Live data configuration
  liveData: {
    // Intervalo de atualização em tempo real (em ms)
    updateInterval: 1000,
    
    // Número máximo de eventos a guardar no cache
    maxCacheSize: 100,
    
    // Quanto tempo guardar dados históricos (em ms)
    historyRetention: 3600000, // 1 hora
  },

  // Track map configuration
  trackMap: {
    // Escala padrão
    defaultZoom: 1,
    
    // Zoom mínimo e máximo
    minZoom: 0.5,
    maxZoom: 2.5,
    
    // Passo de zoom ao clicar nos botões
    zoomStep: 0.2,
    
    // Atualizar posições dos pilotos a cada N ms
    positionUpdateInterval: 100,
    
    // Mostrar nomes dos pilotos por padrão
    showDriverNames: true,
    
    // Colorir carros por número da posição
    colorByPosition: true,
  },

  // Timing table configuration
  timingTable: {
    // Número de pilotos a mostrar por página
    itemsPerPage: 20,
    
    // Atualizar tabela a cada N ms
    updateInterval: 1000,
    
    // Manter histórico de últimas voltas
    lapHistorySize: 10,
    
    // Ordenar por padrão
    defaultSort: 'position',
    
    // Adicionar linha ao topo para líder?
    highlightLeader: true,
  },

  // Telemetry configuration
  telemetry: {
    // Número de pontos de dados a manter
    dataPoints: 1000,
    
    // Intervalo de coleta de dados em ms
    collectionInterval: 100,
    
    // Valores mínimos e máximos esperados (para gráficos)
    ranges: {
      speed: { min: 0, max: 350 },
      rpm: { min: 0, max: 9000 },
      throttle: { min: 0, max: 100 },
      brake: { min: 0, max: 100 },
      fuel: { min: 0, max: 100 },
      tireTemp: { min: 0, max: 150 },
      tirePressure: { min: 20, max: 35 },
      tireWear: { min: 0, max: 100 },
    }
  },

  // UDP Service configuration (backend)
  udp: {
    // Porta padrão de escuta
    defaultPort: 9600,
    
    // Portas alternativas a tentar
    alternativePorts: [9600, 9601, 9602, 9603, 9604],
    
    // IP padrão para ouvir
    defaultHost: '0.0.0.0',
    
    // Timeout para desconexão (em ms)
    connectionTimeout: 30000,
  },

  // Display configuration
  display: {
    // Formato de tempo (lap time, etc)
    timeFormat: 'HH:MM:SS.mmm',
    
    // Unidade de velocidade
    speedUnit: 'km/h', // ou 'mph'
    
    // Casas decimais para RPM
    rpmDecimals: 0,
    
    // Casas decimais para velocidade
    speedDecimals: 1,
    
    // Casas decimais para percentuais
    percentDecimals: 1,
  },

  // Colors
  colors: {
    // Cores por posição (pódio)
    positions: {
      1: '#FFD700', // Ouro
      2: '#C0C0C0', // Prata
      3: '#CD7F32', // Bronze
    },
    
    // Cores por status
    status: {
      running: '#10B981',
      pit: '#F59E0B',
      finished: '#6B7280',
      dnf: '#EF4444',
    },
    
    // Cores dos gráficos
    charts: {
      speed: '#3B82F6',
      rpm: '#F97316',
      throttle: '#10B981',
      brake: '#EF4444',
    }
  },

  // Notifications
  notifications: {
    // Habilitar notificações
    enabled: true,
    
    // Notificar quando piloto muda de posição
    onPositionChange: true,
    
    // Notificar quando piloto faz novo recorde de volta
    onNewFastestLap: true,
    
    // Notificar quando piloto entra em pit
    onPitStop: true,
    
    // Notificar quando piloto abandona
    onDNF: true,
    
    // Volume padrão (0 a 1)
    volume: 0.5,
  },

  // Debug configuration
  debug: {
    // Habilitar logs detalhados
    enabled: process.env.NODE_ENV === 'development',
    
    // Nível de detalhe: 'trace', 'debug', 'info', 'warn', 'error'
    level: 'info',
    
    // Mostrar timing das requisições
    showTiming: false,
    
    // Salvar eventos em localStorage (para debugging)
    logToStorage: false,
  }
};

// Função helper para obter configuração aninhada
export const getConfig = (path: string, defaultValue: any = null) => {
  const keys = path.split('.');
  let current = LiveTimingConfig;
  
  for (const key of keys) {
    if (current[key] !== undefined) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current;
};

// Função helper para setar configuração em runtime
export const setConfig = (path: string, value: any) => {
  const keys = path.split('.');
  let current = LiveTimingConfig;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
};

export default LiveTimingConfig;
