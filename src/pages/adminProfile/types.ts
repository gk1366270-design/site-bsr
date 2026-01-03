export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points?: number;
  createdAt?: string;
}

export interface User {
  id?: string;
  username: string;
  displayName: string;
  role?: string;
  isActive?: boolean;
}

export interface Race {
  id?: string;
  title: string;
  track: string;
  date: string;
  time?: string;
  laps?: string;
  duration?: string;
  pilots?: number;
  status?: string;
  participants?: number | string[];
  maxParticipants?: number;
  category?: string;
  championship?: string;
  description?: string;
  prize?: number;
  createdAt?: string;
  image?: string;
  trackTemp?: number;
  airTemp?: number;
  windSpeed?: number;
  windDirection?: string;
  fuelRecommendation?: number;
  tirePressureFront?: number;
  tirePressureRear?: number;
  brakeBias?: number;
  setupNotes?: string;
  serverIp?: string;
  serverPort?: string;
  // UDP Live Timing Configuration for Assetto Corsa
  udpListenAddress?: string; // Format: IP:Port (e.g., 127.0.0.1:11095) - UDP Plugin Local Port
  udpSendAddress?: string;   // Format: IP:Port (e.g., 127.0.0.1:12095) - UDP Plugin Address
  udpEnabled?: boolean;      // Enable/disable live timing for this race
  udpRefreshInterval?: number; // Refresh interval in milliseconds for live timing updates
}

export interface News {
  id?: string;
  title: string;
  summary: string;
  content: string;
  category?: string;
  published?: boolean;
  tags?: string[];
  image?: string;
  author?: string;
  date?: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Standing {
  id?: string;
  userId?: string;
  userName: string;
  points: number;
  position: number;
  wins: number;
  podiums: number;
  races: number;
  category?: string;
  season?: string;
  championshipName?: string;
  championshipId?: string;
  team?: string;
  polePositions?: number;
  fastestLaps?: number;
  dnfs?: number;
  bestFinish?: number;
  averageFinish?: number;
  totalTime?: string;
  penaltyPoints?: number;
  status?: 'active' | 'disqualified' | 'withdrawn';
  notes?: string;
}

export interface Championship {
  id?: string;
  category: string;
  drivers: Array<{
    name: string;
    points: number;
    team?: string;
  }>;
  raceCount: number;
  vacancies: number;
  registeredPilots: string[];
  description: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRaces: number;
  completedRaces: number;
  totalAchievements: number;
  publishedNews: number;
  recentActivity: number;
}

export interface Settings {
  id?: string;
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  theme: 'light' | 'dark' | 'system';
  defaultLanguage: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxUsers?: number;
  defaultRaceSettings: {
    maxParticipants: number;
    defaultLaps: number;
    defaultDuration: string;
  };
  udpConfiguration: {
    defaultListenAddress: string;
    defaultSendAddress: string;
    defaultRefreshInterval: number;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
  };
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
  createdAt?: string;
  updatedAt?: string;
}