import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, TrendingUp, Target, Users, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-racing.jpg";

interface Driver {
  name: string;
  points: number;
  team?: string;
}

interface Category {
  category: string;
  drivers: Driver[];
  raceCount?: number;
  vacancies?: number;
  registeredPilots?: string[];
  description?: string;
}

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

const Standings = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch user session
    fetch('/api/session')
      .then(res => res.json())
      .then(sessionData => {
        if (sessionData.user) {
          setUser(sessionData.user);
        }
      })
      .catch(err => console.error('Failed to fetch session:', err));

    // Fetch standings data
    fetch('/api/standings')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch standings:', err);
        setLoading(false);
      });
  }, []);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-lg">{position}</span>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-500';
      case 2:
        return 'bg-gray-400';
      case 3:
        return 'bg-amber-600';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="text-center">Carregando classificações...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="container relative flex min-h-[50vh] items-center pt-16">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-black text-foreground md:text-6xl animate-fade-in">
              <span className="text-primary">CLASSIFICAÇÕES</span>
              <br />
              <span className="text-foreground">2026</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Acompanhe o desempenho dos pilotos em todas as categorias do campeonato
            </p>
            <Badge className="mt-4 bg-primary/20 text-primary border-primary/30 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              Temporada em andamento
            </Badge>
          </div>
        </div>
      </section>

      {/* Standings Content */}
      <main className="container py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2 animate-fade-in">Escolha um Campeonato</h2>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Selecione uma categoria para ver as classificações detalhadas
          </p>
        </div>
        
        <Tabs defaultValue={categories[0]?.category || "default"} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-4 bg-background p-4 w-full rounded-lg shadow-lg border border-border mb-8 h-auto min-h-[80px]">
            {categories.map((cat, index) => (
              <TabsTrigger
                key={cat.category}
                value={cat.category}
                className="animate-fade-in px-6 py-3 text-lg font-semibold transition-all duration-300 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg min-w-[200px] text-center flex-1 min-w-[200px] max-w-[300px] whitespace-nowrap h-auto"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {cat.category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => {
            const maxPoints = Array.isArray(category.drivers) && category.drivers.length > 0 ? Math.max(...category.drivers.map(d => d.points)) : 0;
            const userPosition = user && Array.isArray(category.drivers) ? category.drivers.findIndex(d => d.name === user.displayName) + 1 : 0;
            const isUserChampion = userPosition === 1;

            return (
              <TabsContent key={category.category} value={category.category} className="space-y-8">
                {/* Championship Info */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Informações do Campeonato - {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{category.raceCount || 0}</p>
                        <p className="text-sm text-muted-foreground">Corridas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{category.vacancies || 0}</p>
                        <p className="text-sm text-muted-foreground">Vagas Disponíveis</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-500">{category.registeredPilots?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Pilotos Registrados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-500">{Array.isArray(category.drivers) ? category.drivers.length : 0}</p>
                        <p className="text-sm text-muted-foreground">Pilotos Ativos</p>
                      </div>
                    </div>
                    {category.description && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm">{category.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Celebration for champion */}
                {isUserChampion && (
                  <div className="text-center py-8 animate-bounce">
                    <div className="text-6xl animate-pulse">🎉</div>
                    <h2 className="text-3xl font-bold text-yellow-500 mt-4">PARABÉNS CAMPEÃO!</h2>
                    <p className="text-lg text-muted-foreground">Você está liderando {category.category}!</p>
                  </div>
                )}

                {/* Top 3 Summary */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className={`text-center animate-fade-in ${category.drivers[0]?.name === user?.displayName ? 'ring-4 ring-yellow-500 shadow-2xl' : ''}`} style={{ animationDelay: "0.1s" }}>
                    <CardContent className="pt-6">
                      <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
                      <h3 className="font-semibold mb-2">Campeão</h3>
                      <p className="text-3xl font-bold text-yellow-500">
                        {category.drivers[0]?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">{category.drivers[0]?.points || 0} pontos</p>
                    </CardContent>
                  </Card>

                  <Card className={`text-center animate-fade-in ${category.drivers[1]?.name === user?.displayName ? 'ring-4 ring-gray-400 shadow-2xl' : ''}`} style={{ animationDelay: "0.2s" }}>
                    <CardContent className="pt-6">
                      <Medal className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Vice-campeão</h3>
                      <p className="text-3xl font-bold text-gray-400">
                        {category.drivers[1]?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">{category.drivers[1]?.points || 0} pontos</p>
                    </CardContent>
                  </Card>

                  <Card className={`text-center animate-fade-in ${category.drivers[2]?.name === user?.displayName ? 'ring-4 ring-amber-600 shadow-2xl' : ''}`} style={{ animationDelay: "0.3s" }}>
                    <CardContent className="pt-6">
                      <Award className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Terceiro lugar</h3>
                      <p className="text-3xl font-bold text-amber-600">
                        {category.drivers[2]?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">{category.drivers[2]?.points || 0} pontos</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Summary */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <CardContent className="pt-6">
                      <Users className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <p className="text-4xl font-bold">{Array.isArray(category.drivers) ? category.drivers.length : 0}</p>
                      <p className="text-sm text-muted-foreground">Pilotos Ativos</p>
                    </CardContent>
                  </Card>

                  <Card className="text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
                    <CardContent className="pt-6">
                      <Target className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-4xl font-bold">{category.drivers[0]?.points || 0}</p>
                      <p className="text-sm text-muted-foreground">Pontos do Líder</p>
                    </CardContent>
                  </Card>

                  <Card className="text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
                    <CardContent className="pt-6">
                      <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                      <p className="text-4xl font-bold">{Array.isArray(category.drivers) && category.drivers.length > 1 ? Math.max(...category.drivers.map(d => d.points)) - Math.min(...category.drivers.map(d => d.points)) : 0}</p>
                      <p className="text-sm text-muted-foreground">Diferença de Pontos</p>
                    </CardContent>
                  </Card>

                  <Card className="text-center animate-fade-in" style={{ animationDelay: "0.7s" }}>
                    <CardContent className="pt-6">
                      <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                      <p className="text-4xl font-bold">{Array.isArray(category.drivers) ? category.drivers.filter(d => d.points > 0).length : 0}</p>
                      <p className="text-sm text-muted-foreground">Pilotos Pontuando</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Drivers List */}
                <div className="grid gap-4">
                  {category.drivers.map((driver, index) => {
                    const percentage = maxPoints > 0 ? (driver.points / maxPoints) * 100 : 0;
                    const isUser = driver.name === user?.displayName;
                    return (
                      <Card key={driver.name} className={`animate-fade-in hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer ${isUser ? 'ring-2 ring-primary shadow-xl bg-primary/5' : ''}`} style={{ animationDelay: `${index * 0.05}s` }}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${getPositionColor(index + 1)} ${isUser ? 'animate-pulse' : ''}`}>
                                {getPositionIcon(index + 1)}
                              </div>
                              <div>
                                <h3 className={`font-semibold text-xl ${isUser ? 'text-primary' : ''}`}>{driver.name} {isUser && '⭐'}</h3>
                                {driver.team && (
                                  <p className="text-sm font-medium text-primary">{driver.team}</p>
                                )}
                                <p className="text-sm text-muted-foreground">{category.category}</p>
                                <Badge variant={isUser ? "default" : "outline"} className="mt-1">
                                  {index + 1}º lugar {isUser && '- Você!'}
                                </Badge>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`text-5xl font-bold ${isUser ? 'text-primary animate-pulse' : 'text-primary'}`}>{driver.points}</div>
                              <div className="text-sm text-muted-foreground">pontos</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progresso para o líder</span>
                              <span>{percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={percentage} className={`h-3 ${isUser ? 'bg-primary/20' : ''}`} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Standings;
