import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-racing.jpg";
import ProfileOverview from "./ProfileOverview";
import ProfileRaces from "./ProfileRaces";
import ProfileStats from "./ProfileStats";
import ProfileAchievements from "./ProfileAchievements";
import AdminProfile from "../adminProfile";

interface User {
  username: string;
  displayName?: string;
  createdAt?: string;
  steam?: {
    avatar?: string;
  };
  stats?: {
    wins: number;
    podiums: number;
    points: number;
  };
}

interface Race {
  id: number;
  title: string;
  date: string;
  track: string;
  status: string;
}

interface Account {
  username: string;
  displayName?: string;
  createdAt?: string;
  steam?: {
    id?: string;
    displayName?: string;
    avatar?: string;
  };
  stats?: {
    wins: number;
    podiums: number;
    points: number;
  };
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content?: string;
  author?: string;
  date: string;
  image?: string;
  category: string;
  tags?: string[];
  published?: boolean;
}

interface RaceData {
  id: number;
  title: string;
  track: string;
  date: string;
  time?: string;
  laps?: string;
  duration?: string;
  pilots?: number;
  description: string;
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
  participants?: { username: string; registeredAt: string }[];
  setups?: string;
  safetyCar?: boolean;
  championship?: string;
  status?: "upcoming" | "live" | "completed";
}

interface Standing {
  category: string;
  drivers: { name: string; points: number; team?: string }[];
  raceCount?: number;
  vacancies?: number;
  registeredPilots?: string[];
  description?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  icon?: string;
  requirement?: string;
  unlocked?: boolean;
}

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [myRaces, setMyRaces] = useState<Race[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAccounts, setAdminAccounts] = useState<Account[]>([]);
  const [adminNews, setAdminNews] = useState<NewsItem[]>([]);
  const [adminRaces, setAdminRaces] = useState<RaceData[]>([]);
  const [adminStandings, setAdminStandings] = useState<Standing[]>([]);
  const [adminAchievements, setAdminAchievements] = useState<Achievement[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load accounts data
        const accountsResponse = await fetch('/data/accounts.json');
        const accounts = await accountsResponse.json();
        
        // Set admin status (for demo, assume first user is admin)
        setIsAdmin(true);
        
        // Set admin data
        setAdminAccounts(accounts);
        
        // Load other admin data
        const [newsResponse, racesResponse, standingsResponse, achievementsResponse] = await Promise.all([
          fetch('/data/news.json'),
          fetch('/data/races.json'),
          fetch('/data/standings.json'),
          fetch('/data/achievements.json')
        ]);
        
        const [news, races, standings, achievements] = await Promise.all([
          newsResponse.json(),
          racesResponse.json(),
          standingsResponse.json(),
          achievementsResponse.json()
        ]);
        
        setAdminNews(news);
        setAdminRaces(races);
        setAdminStandings(standings);
        setAdminAchievements(achievements);
        setAchievements(achievements);
        
        // Set mock user (for demo)
        if (accounts.length > 0) {
          const mockUser = {
            username: accounts[0].username,
            displayName: accounts[0].displayName,
            createdAt: accounts[0].createdAt,
            steam: accounts[0].steam,
            stats: accounts[0].stats
          };
          setUser(mockUser);
        }
        
        // Set mock races
        setMyRaces(races.slice(0, 3));
        
      } catch (err) {
        console.error('Failed to load data:', err);
        // Set default user for demo
        const defaultUser = {
          username: 'demo_user',
          displayName: 'Usuário Demo',
          createdAt: new Date().toISOString(),
          stats: { wins: 0, podiums: 0, points: 0 }
        };
        setUser(defaultUser);
        setIsAdmin(true);
        setAdminAccounts([]);
        setAdminNews([]);
        setAdminRaces([]);
        setAdminStandings([]);
        setAdminAchievements([]);
        setAchievements([]);
        setMyRaces([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="text-center">Carregando...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="container relative flex min-h-[60vh] items-center pt-16">
          <div className="flex items-center gap-8">
            <div className="h-32 w-32 border-4 border-primary/50 animate-fade-in rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer">
              {user.steam?.avatar ? (
                <img
                  src={user.steam.avatar}
                  alt={user.displayName || user.username}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-2xl" style={{ display: user.steam?.avatar ? 'none' : 'flex' }}>
                <div className="h-16 w-16 rounded-full bg-primary/20" />
              </div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h1 className="font-heading text-4xl font-black text-foreground md:text-5xl">
                Bem-vindo, <span className="text-primary">{user.displayName || user.username}</span>
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Piloto da comunidade Brasil Sim Racing
              </p>
              <div className="mt-4">
                <div className="inline-block bg-primary/20 text-primary border border-primary/30 rounded-full px-4 py-2">
                  Temporada 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <main className="container py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} mb-8`}>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="races">Minhas Corridas</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Painel Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <ProfileOverview user={user} />
          </TabsContent>

          <TabsContent value="races" className="space-y-6">
            <ProfileRaces myRaces={myRaces} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-8">
            <ProfileStats user={user} myRaces={myRaces} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <ProfileAchievements user={user} myRaces={myRaces} achievements={achievements} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminProfile />
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-center mt-12">
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;