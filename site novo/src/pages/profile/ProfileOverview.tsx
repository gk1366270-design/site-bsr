import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Target, Calendar, TrendingUp, Zap, Star, Crown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

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

interface ProfileOverviewProps {
  user: User;
}

const ProfileOverview = ({ user }: ProfileOverviewProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState({
    wins: 0,
    podiums: 0,
    points: 0
  });

  // Animate stat counters
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    const animateValue = (start: number, end: number, key: string) => {
      let current = start;
      const step = (end - start) / steps;
      const timer = setInterval(() => {
        current += step;
        if ((step > 0 && current >= end) || (step < 0 && current <= end)) {
          current = end;
          clearInterval(timer);
        }
        setAnimatedValues(prev => ({ ...prev, [key]: Math.round(current) }));
      }, increment);
    };

    animateValue(0, user?.stats?.wins || 0, 'wins');
    animateValue(0, user?.stats?.podiums || 0, 'podiums');
    animateValue(0, user?.stats?.points || 0, 'points');
  }, [user?.stats]);

  // Enhanced performance data with gradients
  const performanceData = [
    { month: 'Jan', points: 25, wins: 2, podiums: 5 },
    { month: 'Fev', points: 45, wins: 3, podiums: 7 },
    { month: 'Mar', points: 35, wins: 1, podiums: 6 },
    { month: 'Abr', points: 60, wins: 4, podiums: 8 },
    { month: 'Mai', points: 55, wins: 3, podiums: 9 },
    { month: 'Jun', points: 75, wins: 5, podiums: 10 },
  ];

  const raceTypeData = user?.stats ? [
    { name: 'Vitórias', value: user.stats.wins, color: '#fbbf24', gradient: 'from-yellow-400 to-yellow-600' },
    { name: 'Pódios', value: user.stats.podiums, color: '#9ca3af', gradient: 'from-gray-400 to-gray-600' },
    { name: 'Outros', value: Math.max(0, 10 - user.stats.wins - user.stats.podiums), color: '#d97706', gradient: 'from-orange-400 to-orange-600' },
  ] : [];

  const statsCards = [
    {
      id: 'wins',
      icon: Trophy,
      value: animatedValues.wins,
      label: 'Vitórias',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      glowColor: 'shadow-yellow-500/25',
      description: 'Corridas vencidas'
    },
    {
      id: 'podiums',
      icon: Award,
      value: animatedValues.podiums,
      label: 'Pódios',
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/20',
      glowColor: 'shadow-gray-400/25',
      description: 'Posições no top 3'
    },
    {
      id: 'points',
      icon: Target,
      value: animatedValues.points,
      label: 'Pontos',
      color: 'text-amber-600',
      bgColor: 'bg-amber-600/10',
      borderColor: 'border-amber-600/20',
      glowColor: 'shadow-amber-600/25',
      description: 'Pontos acumulados'
    },
    {
      id: 'member',
      icon: Calendar,
      value: user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy', { locale: ptBR }) : 'N/A',
      label: 'Membro desde',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      glowColor: 'shadow-blue-500/25',
      description: 'Data de ingresso'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full px-6 py-3 mb-4">
          <Star className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-primary font-medium">Bem-vindo de volta, {user.displayName || user.username}!</span>
          <Star className="h-5 w-5 text-primary animate-pulse" />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          const isHovered = hoveredCard === card.id;

          return (
            <Card
              key={card.id}
              className={`group relative overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer animate-fade-in ${card.bgColor} ${card.borderColor} ${isHovered ? card.glowColor + ' shadow-2xl' : 'shadow-lg'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color.replace('text-', 'from-').replace('-500', '-400/20')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Floating particles effect */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-current rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                <div className="w-1 h-1 bg-current rounded-full animate-ping absolute top-1 right-1" style={{ animationDelay: '0.5s' }} />
              </div>

              <CardContent className="pt-6 text-center relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${card.bgColor} mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                  <Icon className={`h-8 w-8 ${card.color} transition-all duration-300 group-hover:scale-110`} />
                </div>

                <div className="space-y-1">
                  <p className={`text-4xl font-bold ${card.color} transition-all duration-300 group-hover:scale-110`}>
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </p>
                  <p className="text-lg font-semibold text-foreground">{card.label}</p>
                  <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {card.description}
                  </p>
                </div>

                {/* Progress indicator for numeric values */}
                {typeof card.value === 'number' && card.id !== 'member' && (
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-1000 ${card.color.replace('text-', 'bg-')}`}
                        style={{
                          width: `${Math.min((card.value / 100) * 100, 100)}%`,
                          animation: isHovered ? 'pulse 2s infinite' : 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enhanced Bar Chart */}
        <Card className="group hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Desempenho Mensal
              <Badge variant="secondary" className="ml-auto animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Atualizado
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorWins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="points"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPoints)"
                    className="drop-shadow-sm"
                  />
                  <Area
                    type="monotone"
                    dataKey="wins"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={0.6}
                    fill="url(#colorWins)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Pie Chart */}
        <Card className="group hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Distribuição de Resultados
              <Badge variant="outline" className="ml-auto">
                Temporada 2026
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={raceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    className="drop-shadow-lg"
                  >
                    {raceTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="hsl(var(--background))"
                        strokeWidth={3}
                        className="hover:opacity-80 transition-opacity duration-300"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              {raceTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Progress */}
      <Card className="group hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{ animationDelay: "0.6s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Progresso na Temporada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(((user?.stats?.wins || 0) / 10) * 100)}%
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Meta de Vitórias</div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(((user?.stats?.wins || 0) / 10) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(((user?.stats?.podiums || 0) / 25) * 100)}%
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Meta de Pódios</div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(((user?.stats?.podiums || 0) / 25) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round(((user?.stats?.points || 0) / 200) * 100)}%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Meta de Pontos</div>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(((user?.stats?.points || 0) / 200) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileOverview;