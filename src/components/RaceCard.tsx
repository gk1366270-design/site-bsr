import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Timer, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

interface RaceCardProps {
  id: string;
  image: string;
  title: string;
  track: string;
  date: string;
  time: string;
  laps: string;
  duration: string;
  pilots: number;
  championship?: string;
  status?: "upcoming" | "live" | "completed";
}

const RaceCard = ({
  id,
  image,
  title,
  track,
  date,
  time,
  laps,
  duration,
  pilots,
  championship,
  status = "upcoming",
}: RaceCardProps) => {
  const statusConfig = {
    upcoming: { label: "Em breve", color: "bg-secondary text-secondary-foreground" },
    live: { label: "AO VIVO", color: "bg-destructive text-destructive-foreground animate-pulse" },
    completed: { label: "Finalizado", color: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="group glass-card overflow-hidden rounded-xl transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-3 transform-gpu">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={track}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110 filter"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold uppercase ${statusConfig[status].color}`}>
          {statusConfig[status].label}
        </span>
        {/* Speed lines on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
          <div className="absolute top-1/2 left-0 w-full h-px bg-primary transform -translate-y-1/2 rotate-12" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-primary transform -translate-y-1/2 rotate-6" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-primary transform -translate-y-1/2 -rotate-6" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-primary transform -translate-y-1/2 -rotate-12" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="mb-2 font-heading text-lg font-bold text-foreground line-clamp-2">
          {title}
        </h3>
        
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm">{track}</span>
        </div>

        {championship && (
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
              {championship}
            </Badge>
          </div>
        )}

        {/* Info Grid */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>{laps}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs text-muted-foreground/70">{duration}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{pilots} pilotos</span>
          </div>
          <Button variant="hero" size="sm" asChild>
            <Link to={`/race/${id}`}>
              Ver detalhes
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RaceCard;
