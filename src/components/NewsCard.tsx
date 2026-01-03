import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface NewsCardProps {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  image?: string;
}

const NewsCard = ({ id, category, date, title, description, image }: NewsCardProps) => {
  const categoryColors: Record<string, string> = {
    Regulamento: "bg-destructive/10 text-destructive",
    Parceria: "bg-accent/10 text-accent",
    Resultados: "bg-secondary/10 text-secondary",
    Campeonato: "bg-primary/10 text-primary",
    Noticias: "bg-blue-100 text-blue-800",
  };

  return (
    <article className="group glass-card overflow-hidden rounded-xl p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-2 hover:rotate-1 transform-gpu">
      {/* Image */}
      {image && (
        <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${categoryColors[category] || categoryColors.Campeonato}`}>
          {category}
        </span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>

      {/* Content */}
      <h3 className="mb-3 font-heading text-lg font-bold text-foreground transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
        {description}
      </p>

      {/* Link */}
      <Link
        to={`/news/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2"
      >
        Ler mais
        <ChevronRight className="h-4 w-4" />
      </Link>
    </article>
  );
};

export default NewsCard;
