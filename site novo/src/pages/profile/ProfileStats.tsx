import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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

interface ProfileStatsProps {
  user: User;
  myRaces: Race[];
}

const ProfileStats = ({ user, myRaces }: ProfileStatsProps) => {
  const raceTypeData = user?.stats ? [
    { name: 'Vitórias', value: user.stats.wins, color: '#fbbf24' },
    { name: 'Pódios', value: user.stats.podiums, color: '#9ca3af' },
    { name: 'Outros', value: Math.max(0, 10 - user.stats.wins - user.stats.podiums), color: '#d97706' },
  ] : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={raceTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {raceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métricas Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Taxa de Vitória</span>
            <span className="font-semibold">{(user?.stats?.wins || 0) > 0 ? (((user?.stats?.wins || 0) / ((user?.stats?.wins || 0) + (user?.stats?.podiums || 0) + 5)) * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Pontos por Corrida</span>
            <span className="font-semibold">{myRaces.length > 0 ? ((user?.stats?.points || 0) / myRaces.length).toFixed(1) : 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Corridas Participadas</span>
            <span className="font-semibold">{myRaces.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;