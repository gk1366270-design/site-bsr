import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RaceCard from "@/components/RaceCard";

interface RaceItem {
  id: number;
  title: string;
  track: string;
  date: string;
  time: string;
  image: string;
  pilots: number;
  participants: { username: string; registeredAt: string }[];
  championship?: string;
  status?: string;
  laps?: string;
  duration?: string;
}

const Races = () => {
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/races')
      .then(res => res.json())
      .then(data => {
        setRaces(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch races:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-card overflow-hidden rounded-xl">
                <Skeleton className="aspect-video w-full" />
                <div className="p-5">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 animate-pulse" style={{ animationDelay: '1s' }} />
      <Header />
      <main className="container py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Corridas</h1>
          <p className="text-muted-foreground">
            Explore todas as corridas disponíveis e inscreva-se nas suas favoritas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {races.map((race, index) => (
            <div
              key={race.id}
              className="animate-fade-in opacity-0"
              style={{
                animationDelay: `${index * 0.15}s`,
                transform: index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)',
                animation: 'slideIn 0.6s ease-out forwards'
              }}
            >
              <RaceCard
                id={race.id.toString()}
                image={race.image}
                title={race.title}
                track={race.track}
                date={new Date(race.date).toLocaleDateString('pt-BR')}
                time={race.time}
                laps={race.laps || "N/A"}
                duration={race.duration || "N/A"}
                pilots={race.pilots}
                championship={race.championship}
                status="upcoming"
              />
            </div>
          ))}
        </div>

        {races.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma corrida encontrada.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Races;