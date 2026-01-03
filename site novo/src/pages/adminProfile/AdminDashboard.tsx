import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3, Calendar, TrendingUp, Users, Trophy, Flag, Newspaper, Award, ShieldCheck, Clock, Settings, Zap, MessageCircle, GitCompare, TrendingDown, DollarSign, Monitor, Gamepad, Headset, Video, Gift } from 'lucide-react';
import { AdminStats, Race, News, User, Standing } from './types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditDialog from './EditDialog';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface AdminDashboardProps {
  stats: AdminStats;
  races: Race[];
  setRaces: React.Dispatch<React.SetStateAction<Race[]>>;
  news: News[];
  setNews: React.Dispatch<React.SetStateAction<News[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  standings: Standing[];
  setStandings: React.Dispatch<React.SetStateAction<Standing[]>>;
  isLoading: boolean;
  setActiveTab?: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, races, setRaces, news, setNews, users, setUsers, standings, setStandings, isLoading, setActiveTab }) => {
  const [editItem, setEditItem] = useState<Race | News | User | Standing | null>(null);
  const [dialogType, setDialogType] = useState<'races' | 'news' | 'users' | 'standings' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    try {
      if (dialogType === 'races') {
        const savedItem = {
          ...data,
          id: data.id || `race-${Date.now()}`,
          createdAt: data.createdAt || new Date().toISOString()
        } as Race;
        
        setRaces(prev => data.id
          ? prev.map(item => item.id === data.id ? savedItem : item)
          : [savedItem, ...prev]
        );
      } else if (dialogType === 'news') {
        const savedItem = {
          ...data,
          id: data.id || `news-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as News;
        
        setNews(prev => data.id
          ? prev.map(item => item.id === data.id ? savedItem : item)
          : [...prev, savedItem]
        );
      } else if (dialogType === 'users') {
        const savedItem: User = {
          id: data.id as string || `user-${Date.now()}`,
          username: data.username as string || `user${Date.now()}`,
          displayName: data.displayName as string || data.username as string,
          email: data.email as string || '',
          role: data.role as 'admin' | 'user' | 'premium' || 'user',
          createdAt: data.createdAt as string || new Date().toISOString(),
          isActive: data.isActive === 'true',
          lastLogin: data.lastLogin as string || new Date().toISOString(),
          steam: {},
          stats: { wins: 0, podiums: 0, points: 0 }
        };
        
        setUsers(prev => data.id
          ? prev.map(item => item.id === data.id ? savedItem : item)
          : [...prev, savedItem]
        );
      } else if (dialogType === 'standings') {
        const savedItem = {
          ...data,
          id: data.id || `standing-${Date.now()}`
        } as Standing;
        
        setStandings(prev => data.id
          ? prev.map(item => item.id === data.id ? savedItem : item)
          : [...prev, savedItem]
        );
      }
      
      setIsDialogOpen(false);
      setEditItem(null);
      setDialogType(null);
      
      toast({
        title: "Sucesso",
        description: `Item criado com sucesso.`,
      });
    } catch (error) {
      console.error(`Error saving item:`, error);
      toast({
        title: "Erro",
        description: `Falha ao salvar item. Por favor, tente novamente.`,
        variant: "destructive",
      });
    }
  }, [dialogType, setRaces, setNews, setUsers, setStandings, toast]);

  const handleQuickActionClick = (type: 'races' | 'news' | 'users' | 'standings') => {
    setDialogType(type);
    
    // Set default values for each type
    if (type === 'races') {
      setEditItem({
        id: '',
        title: '',
        track: '',
        date: new Date().toISOString(),
        time: '20:00',
        laps: '',
        duration: '',
        pilots: 0,
        description: '',
        championship: '',
        trackTemp: 0,
        airTemp: 0,
        windSpeed: 0,
        windDirection: '',
        fuelRecommendation: 0,
        tirePressureFront: 0,
        tirePressureRear: 0,
        brakeBias: 0,
        setupNotes: '',
        participants: 0,
        maxParticipants: 20,
        prize: 0,
        category: 'formula',
        status: 'upcoming',
        createdAt: new Date().toISOString()
      });
    } else if (type === 'news') {
      setEditItem({
        id: '',
        title: '',
        content: '',
        summary: '',
        image: '',
        author: '',
        category: '',
        published: false,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else if (type === 'users') {
      setEditItem({
        id: '',
        username: `user${Date.now()}`,
        displayName: '',
        role: 'user',
        createdAt: new Date().toISOString(),
        isActive: true,
        lastLogin: new Date().toISOString(),
        stats: { wins: 0, podiums: 0, points: 0 }
      });
    } else if (type === 'standings') {
      setEditItem({
        id: '',
        userId: '',
        userName: '',
        points: 0,
        position: 0,
        wins: 0,
        podiums: 0,
        races: 0,
        category: '',
        season: ''
      });
    }
    
    setIsDialogOpen(true);
  };

  const statItems = [
    { title: 'Total de Usuários', value: stats.totalUsers, icon: <Users className="h-8 w-8 text-blue-600" />, color: 'text-blue-600' },
    { title: 'Usuários Ativos', value: stats.activeUsers, icon: <TrendingUp className="h-8 w-8 text-green-600" />, color: 'text-green-600' },
    { title: 'Total de Corridas', value: stats.totalRaces, icon: <Flag className="h-8 w-8 text-orange-600" />, color: 'text-orange-600' },
    { title: 'Corridas Completas', value: stats.completedRaces, icon: <Trophy className="h-8 w-8 text-purple-600" />, color: 'text-purple-600' },
    { title: 'Notícias Publicadas', value: stats.publishedNews, icon: <Newspaper className="h-8 w-8 text-cyan-600" />, color: 'text-cyan-600' },
    { title: 'Total de Conquistas', value: stats.totalAchievements, icon: <Award className="h-8 w-8 text-yellow-600" />, color: 'text-yellow-600' },
  ];

  const quickActions = [
    {
      title: 'Criar Nova Corrida',
      description: 'Organize um novo evento para a comunidade',
      icon: <Flag className="h-6 w-6 text-primary" />,
      color: 'bg-primary/10',
      type: 'races' as const
    },
    {
      title: 'Publicar Notícia',
      description: 'Compartilhe novidades com a comunidade',
      icon: <Newspaper className="h-6 w-6 text-secondary" />,
      color: 'bg-secondary/10',
      type: 'news' as const
    },
    {
      title: 'Gerenciar Usuários',
      description: 'Administre contas e permissões',
      icon: <Users className="h-6 w-6 text-green-600" />,
      color: 'bg-green-500/10',
      type: 'users' as const
    },
    {
      title: 'Configurar Campeonatos',
      description: 'Crie e gerencie classificações',
      icon: <Trophy className="h-6 w-6 text-yellow-600" />,
      color: 'bg-yellow-500/10',
      type: 'standings' as const
    }
  ];

  const systemStatus = [
    {
      name: 'Servidor Principal',
      status: 'online',
      icon: <Monitor className="h-5 w-5 text-green-500" />
    },
    {
      name: 'Banco de Dados',
      status: 'online',
      icon: <Settings className="h-5 w-5 text-green-500" />
    },
    {
      name: 'Serviço UDP',
      status: 'online',
      icon: <Zap className="h-5 w-5 text-green-500" />
    },
    {
      name: 'WebSocket',
      status: 'online',
      icon: <GitCompare className="h-5 w-5 text-green-500" />
    }
  ];

  const recentActivity = [
    {
      type: 'user',
      action: 'Novo usuário registrado',
      user: 'piloto_novo',
      time: '2 horas atrás',
      icon: <Users className="h-4 w-4 text-blue-500" />
    },
    {
      type: 'race',
      action: 'Corrida concluída',
      race: 'Campeonato GT3 - Etapa 1',
      time: '4 horas atrás',
      icon: <Flag className="h-4 w-4 text-orange-500" />
    },
    {
      type: 'news',
      action: 'Artigo de notícia publicado',
      title: 'Resultado da última corrida',
      time: '1 dia atrás',
      icon: <Newspaper className="h-4 w-4 text-cyan-500" />
    },
    {
      type: 'achievement',
      action: 'Nova conquista desbloqueada',
      user: 'campeao_2023',
      achievement: 'Vencedor de Endurance',
      time: '2 dias atrás',
      icon: <Award className="h-4 w-4 text-yellow-500" />
    }
  ];

  const performanceMetrics = [
    { name: 'Crescimento de Usuários (7 dias)', value: '+12.5%', trend: 'up' },
    { name: 'Taxa de Conclusão de Corridas', value: '94.2%', trend: 'up' },
    { name: 'Engajamento de Notícias', value: '8.3K visualizações', trend: 'up' },
    { name: 'Atividade de Usuários', value: '72% ativos', trend: 'down' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
          <p className="text-muted-foreground">Visão geral e gerenciamento da Brasil Sim Racing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Ações Rápidas
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statItems.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className={`hover:shadow-lg transition-shadow cursor-pointer ${action.color}`}>
            <CardContent className="p-6" onClick={() => {
              if (action.type === 'standings' && setActiveTab) {
                // Navigate to standings section instead of opening dialog
                setActiveTab('standings');
              } else {
                handleQuickActionClick(action.type);
              }
            }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                {action.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5" />
              <span>Status do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {system.icon}
                    <span className="font-medium">{system.name}</span>
                  </div>
                  <Badge variant={system.status === 'online' ? 'default' : 'destructive'}>
                    {system.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Métricas de Desempenho</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Badge variant="secondary">{metric.value}</Badge>
                  </div>
                  <Progress value={Math.min(100, parseFloat(metric.value) || 0)} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Atividade Recente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{activity.action}</span>
                            {activity.user && <span className="text-muted-foreground ml-2">@{activity.user}</span>}
                            {activity.race && <span className="text-muted-foreground ml-2">- {activity.race}</span>}
                            {activity.title && <span className="text-muted-foreground ml-2">- {activity.title}</span>}
                            {activity.achievement && <span className="text-muted-foreground ml-2">- {activity.achievement}</span>}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Informações do Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Recursos do Servidor</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Uso de CPU</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                      <div className="flex justify-between mt-2">
                        <span>Uso de Memória</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                      <div className="flex justify-between mt-2">
                        <span>Armazenamento</span>
                        <span>32% usado</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Configurações</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Versão do Sistema</span>
                        <span>2.1.4</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Última Atualização</span>
                        <span>03/01/2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge variant="default">Operacional</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Linha do Tempo de Atividades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Hoje</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Atividades de Hoje</h3>
                    <p className="text-sm text-muted-foreground">5 novas inscrições, 2 corridas concluídas, 1 notícia publicada</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Ontem</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Campeonato Concluído</h3>
                    <p className="text-sm text-muted-foreground">Campeonato Endurance 2023 teve seu vencedor: @campeao_2023</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Esta Semana</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Novo Recorde</h3>
                    <p className="text-sm text-muted-foreground">Mais de 100 pilotos participaram do último evento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Análise de Usuários</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Distribuição de Usuários</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Pilotos Ativos</span>
                        <span>{stats.activeUsers} ({Math.round((stats.activeUsers / stats.totalUsers) * 100 || 0)}%)</span>
                      </div>
                      <Progress value={Math.min(100, (stats.activeUsers / stats.totalUsers) * 100 || 0)} className="h-2" />
                      <div className="flex justify-between items-center mt-2">
                        <span>Pilotos Inativos</span>
                        <span>{stats.totalUsers - stats.activeUsers} ({Math.round(((stats.totalUsers - stats.activeUsers) / stats.totalUsers) * 100 || 0)}%)</span>
                      </div>
                      <Progress value={Math.min(100, ((stats.totalUsers - stats.activeUsers) / stats.totalUsers) * 100 || 0)} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flag className="h-5 w-5" />
                  <span>Análise de Corridas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Status das Corridas</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Corridas Completas</span>
                        <span>{stats.completedRaces} ({Math.round((stats.completedRaces / stats.totalRaces) * 100 || 0)}%)</span>
                      </div>
                      <Progress value={Math.min(100, (stats.completedRaces / stats.totalRaces) * 100 || 0)} className="h-2" />
                      <div className="flex justify-between items-center mt-2">
                        <span>Corridas Pendentes</span>
                        <span>{stats.totalRaces - stats.completedRaces} ({Math.round(((stats.totalRaces - stats.completedRaces) / stats.totalRaces) * 100 || 0)}%)</span>
                      </div>
                      <Progress value={Math.min(100, ((stats.totalRaces - stats.completedRaces) / stats.totalRaces) * 100 || 0)} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Welcome Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bem-vindo ao Painel de Administração! Use a barra lateral para navegar entre as diferentes seções de gerenciamento.
        </AlertDescription>
      </Alert>
      
      {/* Edit Dialog for Quick Actions */}
      {dialogType && editItem && (
        <EditDialog
          item={editItem}
          type={dialogType}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditItem(null);
            setDialogType(null);
          }}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default AdminDashboard;