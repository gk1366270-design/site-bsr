/**
 * Dynamic Environment Configuration
 * Automatically detects if running locally or on Discloud
 * and sets URLs accordingly
 */

// Detect if running in development mode
const isDev = import.meta.env.DEV;

// Detect Discloud environment
const isDiscloud = process.env.NODE_ENV === 'production' && 
                   !window.location.hostname.includes('localhost') && 
                   !window.location.hostname.includes('127.0.0.1') &&
                   !window.location.hostname.includes('192.168');

// Your local machine IP
const LOCAL_IP = '192.168.1.66';
const LOCAL_FRONTEND_PORT = 3000;
const LOCAL_BACKEND_PORT = 8080;

// Discloud domain
const DISCLOUD_DOMAIN = 'https://brasilsimracing.discloud.app';

/**
 * Get the appropriate base URL for the frontend
 */
export const getFrontendUrl = (): string => {
  if (isDev) {
    // In development, use localhost
    return `http://localhost:${LOCAL_FRONTEND_PORT}`;
  }
  
  // In production
  if (isDiscloud || window.location.hostname.includes('discloud')) {
    return DISCLOUD_DOMAIN;
  }
  
  // If accessing from local network
  if (window.location.hostname.includes('192.168')) {
    return `http://${window.location.hostname}:${LOCAL_FRONTEND_PORT}`;
  }
  
  // Fallback
  return window.location.origin;
};

/**
 * Get the appropriate base URL for the backend API
 */
export const getBackendUrl = (): string => {
  if (isDev) {
    // In development with Vite, use relative paths or localhost
    return `http://localhost:${LOCAL_BACKEND_PORT}`;
  }
  
  // In production
  if (isDiscloud || window.location.hostname.includes('discloud')) {
    return DISCLOUD_DOMAIN;
  }
  
  // If accessing from local network, use the same IP
  if (window.location.hostname.includes('192.168')) {
    return `http://${window.location.hostname}:${LOCAL_BACKEND_PORT}`;
  }
  
  // Fallback to current origin
  return window.location.origin;
};

/**
 * Get Steam authentication URLs
 */
export const getSteamAuthUrls = () => {
  const frontendUrl = getFrontendUrl();
  
  return {
    returnUrl: `${frontendUrl}/auth/steam/return`,
    realm: frontendUrl,
  };
};

// Export environment info for debugging
export const envConfig = {
  isDev,
  isDiscloud,
  localIp: LOCAL_IP,
  localFrontendPort: LOCAL_FRONTEND_PORT,
  localBackendPort: LOCAL_BACKEND_PORT,
  discloudDomain: DISCLOUD_DOMAIN,
  frontendUrl: getFrontendUrl(),
  backendUrl: getBackendUrl(),
};

console.log('[Environment Config]', envConfig);
