import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Flag, Zap, Target } from "lucide-react";

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

interface ProfileAchievementsProps {
  user: User;
  myRaces: Race[];
  achievements: Achievement[];
}

const ProfileAchievements = ({ user, myRaces, achievements }: ProfileAchievementsProps) => {
  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return <Trophy className="h-12 w-12 text-yellow-500" />;
      case 'medal':
        return <Award className="h-12 w-12 text-gray-400" />;
      case 'crown':
        return <Award className="h-12 w-12 text-purple-500" />;
      case 'flag':
        return <Flag className="h-12 w-12 text-green-500" />;
      case 'zap':
        return <Zap className="h-12 w-12 text-yellow-500" />;
      case 'target':
        return <Target className="h-12 w-12 text-amber-600" />;
      default:
        return <Award className="h-12 w-12" />;
    }
  };

  const isAchievementUnlocked = (achievement: Achievement) => {
    if (!user?.stats) return false;
    const stats = user.stats;
    const racesCount = myRaces.length;
    switch (achievement.id) {
      case 'first_win':
        return stats.wins >= 1;
      case 'podium_master':
        return stats.podiums >= 10;
      case 'champion':
        return stats.points >= 100; // assuming high points means champion
      case 'dedicated_racer':
        return racesCount >= 20;
      case 'speed_demon':
        return false; // no data, assume not
      case 'consistent_driver':
        return false; // no data
      default:
        return false;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement, index) => {
        const unlocked = isAchievementUnlocked(achievement);
        return (
          <Card key={achievement.id} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                {getAchievementIcon(achievement.icon || 'trophy')}
              </div>
              <h3 className="font-semibold">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
              <p className="text-sm mb-2">Pontos: {achievement.points}</p>
              <Badge variant={unlocked ? "default" : "secondary"} className="mt-2">
                {unlocked ? "Conquistado" : "Pendente"}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfileAchievements;