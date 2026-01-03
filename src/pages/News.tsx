import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: string;
  image?: string;
}

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
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
                <Skeleton className="aspect-video w-full rounded-lg mb-4" />
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-24" />
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
          <h1 className="text-4xl font-bold mb-2">Notícias</h1>
          <p className="text-muted-foreground">
            Fique por dentro das últimas novidades do mundo do sim racing
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in opacity-0"
              style={{
                animationDelay: `${index * 0.15}s`,
                transform: index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)',
                animation: 'slideIn 0.6s ease-out forwards'
              }}
            >
              <NewsCard
                id={item.id.toString()}
                category={item.category}
                date={new Date(item.date).toLocaleDateString('pt-BR')}
                title={item.title}
                description={item.summary}
                image={item.image}
              />
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma notícia encontrada.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default News;