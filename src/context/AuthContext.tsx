import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';

interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  role: 'admin' | 'user' | 'premium';
  avatar?: string;
  stats?: {
    wins: number;
    podiums: number;
    points: number;
  };
}

interface SessionResponse {
  user: User | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const sessionData = await apiGet<SessionResponse>('/api/session');
      
      if (sessionData.user) {
        // Load full user data with avatar and details
        try {
          const fullData = await apiGet<SessionResponse>('/api/user/full');
          if(fullData.user) {
            setUser(fullData.user);
          } else {
            setUser(sessionData.user);
          }
        } catch(e) {
          console.warn('Failed to get full user data, using session data:', e);
          setUser(sessionData.user);
        }
        setIsLoading(false);
        return true;
      } else {
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    toast({
      title: 'Bem-vindo de volta!',
      description: `Login realizado com sucesso, ${userData.displayName || userData.username}!`,
    });
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    try {
      await apiPost('/api/logout', {});
      toast({
        title: 'Até logo!',
        description: 'Você foi desconectado com sucesso.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao fazer logout. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
      localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    }
  };

  useEffect(() => {
    const checkInitialAuth = async () => {
      await checkAuth();
    };
    
    checkInitialAuth();
  }, []);

  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;