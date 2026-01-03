import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import AchievementManagement from './AchievementManagement';
import RaceManagement from './RaceManagement';
import NewsManagement from './NewsManagement';
import StandingManagement from './StandingManagement';
import SettingsManagement from './SettingsManagement';
import { AdminStats, User, Achievement, Race, News, Standing, Settings as SettingsType } from './types';

const AdminProfile: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [settings, setSettings] = useState<SettingsType>({
    siteName: 'Sim Racing Boost',
    siteDescription: 'Plataforma de gerenciamento de corridas virtuais',
    theme: 'system',
    defaultLanguage: 'pt-BR',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    defaultRaceSettings: {
      maxParticipants: 20,
      defaultLaps: 35,
      defaultDuration: '60 minutos'
    },
    udpConfiguration: {
      defaultListenAddress: '127.0.0.1:11095',
      defaultSendAddress: '127.0.0.1:12095',
      defaultRefreshInterval: 1000
    },
    socialMedia: {},
    contactInfo: {
      email: 'contato@simracingboost.com'
    },
    seoSettings: {
      metaTitle: 'Sim Racing Boost',
      metaDescription: 'Plataforma de gerenciamento de corridas virtuais',
      metaKeywords: 'sim racing, corrida virtual, esports'
    }
  });
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRaces: 0,
    completedRaces: 0,
    publishedNews: 0,
    totalAchievements: 0,
    recentActivity: 0
  });

  const fetchData = useCallback(async (type: string, endpoint: string, setter: React.Dispatch<React.SetStateAction<unknown>>) => {
    try {
      setIsLoading(true);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }
      
      const data = await response.json();
      setter(data);
      
      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} data loaded successfully.`,
      });
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to load ${type} data.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load initial data
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchData('users', '/api/accounts', setUsers),
        fetchData('achievements', '/api/achievements', setAchievements),
        fetchData('races', '/api/races', setRaces),
        fetchData('news', '/api/news', setNews),
        fetchData('standings', '/api/standings', setStandings),
        fetchData('settings', '/api/settings', setSettings),
      ]);
    };

    loadAllData();
  }, [fetchData]);

  // Calculate stats when data changes
  useEffect(() => {
    setStats({
      totalUsers: users.length,
      activeUsers: users.filter(user => user.isActive).length,
      totalRaces: races.length,
      completedRaces: races.filter(race => race.status === 'completed').length,
      publishedNews: news.filter(item => item.published).length,
      totalAchievements: achievements.length,
      recentActivity: 0 // Remove the lastLogin filter as it doesn't exist in User interface
    });
  }, [users.length, races.length, news.length, achievements.length, users, races, news]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminDashboard
          stats={stats}
          races={races}
          setRaces={setRaces}
          news={news}
          setNews={setNews}
          users={users}
          setUsers={setUsers}
          standings={standings}
          setStandings={setStandings}
          isLoading={isLoading}
          setActiveTab={setActiveTab}
        />;
      case 'users':
        return <UserManagement users={users} setUsers={setUsers} isLoading={isLoading} />;
      case 'achievements':
        return <AchievementManagement achievements={achievements} setAchievements={setAchievements} isLoading={isLoading} />;
      case 'races':
        return <RaceManagement races={races} setRaces={setRaces} isLoading={isLoading} />;
      case 'news':
        return <NewsManagement news={news} setNews={setNews} isLoading={isLoading} />;
      case 'standings':
        // Note: standings contains championship data (from standings.json)
        // which includes drivers, race counts, and other championship info
        return <StandingManagement standings={standings} setStandings={setStandings} isLoading={isLoading} />;
      case 'settings':
        return <SettingsManagement settings={settings} setSettings={setSettings} isLoading={isLoading} />;
      default:
        return <AdminDashboard
          stats={stats}
          races={races}
          setRaces={setRaces}
          news={news}
          setNews={setNews}
          users={users}
          setUsers={setUsers}
          standings={standings}
          setStandings={setStandings}
          isLoading={isLoading}
          setActiveTab={setActiveTab}
        />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminProfile;