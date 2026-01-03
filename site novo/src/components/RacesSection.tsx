import RaceCard from "@/components/RaceCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import trackMugello from "@/assets/track-mugello.jpg";
import trackInterlagos from "@/assets/track-interlagos.jpg";
import trackSpa from "@/assets/track-spa.jpg";

const RacesSection = () => {
  const races = [
    {
      id: "1",
      image: trackMugello,
      title: "Campeonato Brasileiro GT3 - Etapa 1",
      track: "Mugello Circuit",
      date: "09/06/2025",
      time: "18:00",
      laps: "35 voltas",
      duration: "50 min",
      pilots: 24,
    },
    {
      id: "2",
      image: trackInterlagos,
      title: "Copa Brasil Porsche 911 - Etapa 2",
      track: "Interlagos",
      date: "16/06/2025",
      time: "20:00",
      laps: "28 voltas",
      duration: "40 min",
      pilots: 18,
    },
    {
      id: "3",
      image: trackSpa,
      title: "Endurance Series - 3h de Spa",
      track: "Spa-Francorchamps",
      date: "23/06/2025",
      time: "19:00",
      laps: "45 voltas",
      duration: "3 horas",
      pilots: 32,
    },
  ];

  return (
    <section id="corridas" className="py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="mb-2 inline-block font-heading text-sm font-bold uppercase tracking-wider text-primary">
              Agenda
            </span>
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Próximas Corridas
            </h2>
          </div>
          <Button variant="ghost" className="group text-muted-foreground hover:text-foreground" asChild>
            <Link to="/races">
              Ver todas
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {races.map((race, index) => (
            <div
              key={race.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <RaceCard {...race} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RacesSection;
