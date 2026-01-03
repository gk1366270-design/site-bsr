import { Trophy, Server, Shield, Users } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Trophy,
      title: "Campeonatos Oficiais",
      description:
        "Participe de campeonatos organizados com regras claras, fiscalização e premiações.",
    },
    {
      icon: Server,
      title: "Servidores Dedicados",
      description:
        "Infraestrutura de alta performance para corridas sem lag ou desconexões.",
    },
    {
      icon: Shield,
      title: "Fair Play Garantido",
      description:
        "Sistema anti-cheating e penalidades para garantir corridas limpas.",
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description:
        "Conecte-se com outros pilotos, forme equipes e faça parte da maior liga do Brasil.",
    },
  ];

  return (
    <section id="sobre" className="border-y border-border/50 bg-card/30 py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-2 inline-block font-heading text-sm font-bold uppercase tracking-wider text-primary">
            Por que escolher a BSR?
          </span>
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            A Melhor Experiência em Sim Racing
          </h2>
        </div>

        {/* Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted transition-all duration-300 group-hover:bg-primary group-hover:glow-primary">
                <feature.icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
              </div>
              <h3 className="mb-3 font-heading text-lg font-bold">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
