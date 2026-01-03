import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const NewsSection = () => {
  const news = [
    {
      id: "1",
      category: "Regulamento",
      date: "01/12/2025",
      title: "Campeonato BSR - Temporada 2026",
      description:
        "Inscrições abertas para a temporada 2026 da Brasil Sim Racing. Novas categorias e premiações para os campeões.",
      image: "/assets/images/track-interlagos.jpg",
    },
    {
      id: "2",
      category: "Resultados",
      date: "25/11/2025",
      title: "Resultado da 1ª Etapa GT3",
      description:
        "Confira os resultados completos da primeira etapa do campeonato. Grandes batalhas e surpresas na liderança.",
      image: "/assets/images/track-mugello.jpg",
    },
    {
      id: "3",
      category: "Parceria",
      date: "10/11/2025",
      title: "Novas regras de classificação",
      description:
        "Alterações no sistema de pontos e classificação geral para garantir mais competitividade e justiça.",
      image: "/assets/images/track-spa.jpg",
    },
    {
      id: "4",
      category: "Campeonato",
      date: "05/11/2025",
      title: "Parceria com simuladores oficiais",
      description:
        "BSR anuncia parceria com os principais desenvolvedores de simuladores de corrida do mercado.",
      image: "/assets/images/track-interlagos.jpg",
    },
  ];

  return (
    <section id="noticias" className="py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="mb-2 inline-block font-heading text-sm font-bold uppercase tracking-wider text-primary">
              Fique por dentro
            </span>
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Últimas Notícias
            </h2>
          </div>
          <Button variant="ghost" className="group text-muted-foreground hover:text-foreground" asChild>
            <Link to="/news">
              Ver todas
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {news.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <NewsCard
                id={item.id}
                category={item.category}
                date={item.date}
                title={item.title}
                description={item.description}
                image={item.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
