export const getApiBaseUrl = (): string => {
  // In development with Vite, use relative paths since Vite will proxy API calls
  // to the backend server. The backend server runs on a different port.
  if (import.meta.env.DEV) {
    // Vite development mode - use relative paths
    return '';
  }
  // In production, use relative paths
  return '';
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + endpoint;
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return response;
  } catch (error) {
    console.error('API fetch error:', error);
    
    // If we're in development and the backend server is not running,
    // provide a helpful error message
    if (import.meta.env.DEV && error.name === 'TypeError') {
      throw new Error(
        `Backend server not running. Please start the backend server on port 8080. ` +
        `Run: npm run start`
      );
    }
    
    throw error;
  }
};

export const apiGet = async <T>(endpoint: string): Promise<T> => {
  const response = await apiFetch(endpoint);
  
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error || JSON.stringify(errorData)}`);
    } else {
      const text = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${text.substring(0, 100)}...`);
    }
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    // Handle non-JSON responses (like HTML)
    const text = await response.text();
    throw new Error(`Expected JSON but got HTML/other content. This usually means the API route doesn't exist or the server is misconfigured. Response: ${text.substring(0, 200)}...`);
  }
};

export const apiPost = async <T>(endpoint: string, data: unknown): Promise<T> => {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return await response.json();
};