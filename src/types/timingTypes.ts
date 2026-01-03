export interface Driver {
  position: number;
  number: string;
  name: string;
  team: string;
  car: string;
  lap: number;
  time: string;
  gap: string;
  bestLap: string;
  lastLap: string;
  status: string;
  pitStops: number;
  tireCompound: string;
  fuelLevel: number;
}

export interface LiveTimingData {
  sessionStatus: string;
  sessionTime: string;
  drivers: Driver[];
  trackConditions: {
    trackTemp: string;
    airTemp: string;
    humidity: string;
    windSpeed: string;
    windDirection: string;
  };
  sessionInfo: {
    sessionType: string;
    remainingTime: string;
    totalLaps: number;
    currentLap: number;
  };
  lastUpdated: string;
}