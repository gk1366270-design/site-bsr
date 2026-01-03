import { Button } from "@/components/ui/button";
import { Trophy, Play, Users, Calendar, ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-racing.jpg";

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "500+", label: "Pilotos Ativos" },
    { icon: Trophy, value: "50+", label: "Campeonatos" },
    { icon: Calendar, value: "200+", label: "Corridas/Ano" },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="hero-overlay absolute inset-0" />

      {/* Content */}
      <div className="container relative flex min-h-screen flex-col justify-center pt-16">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary">
              Temporada 2026 em andamento
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-6 font-heading text-5xl font-black leading-tight md:text-7xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="text-primary">BRASIL</span>
            <br />
            <span className="text-foreground">SIM RACING</span>
          </h1>

          {/* Description */}
          <p className="mb-8 max-w-lg text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A maior comunidade brasileira de simuladores de corrida. Notícias,
            campeonatos e eventos para apaixonados por velocidade.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              <Trophy className="h-5 w-5" />
              VER CAMPEONATOS
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="heroOutline" size="xl">
              <Play className="h-5 w-5" />
              COMO FUNCIONA
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap gap-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/50 p-1">
          <div className="h-2 w-1 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
