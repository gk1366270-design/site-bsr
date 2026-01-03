import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/session')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(err => console.error('Failed to fetch session:', err));
  }, []);
  return (
    <section id="contato" className="py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-muted/50 to-card p-12 text-center md:p-20">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

          <div className="relative">
            <h2 className="mx-auto mb-6 max-w-2xl font-heading text-3xl font-bold md:text-5xl">
              Pronto para acelerar?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              Junte-se à maior comunidade de sim racing do Brasil. Crie sua conta
              gratuitamente e comece a competir hoje.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Button variant="cta" size="xl" asChild>
                  <a href="/profile">
                    PAINEL
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </Button>
              ) : (
                <Button variant="cta" size="xl" asChild>
                  <a href="/login">
                    Criar Conta Grátis
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </Button>
              )}
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/standings">
                  <Trophy className="h-5 w-5 mr-2" />
                  Ver Classificação
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl">
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
