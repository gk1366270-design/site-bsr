import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Users, Calendar, Zap, Shield, Star, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-racing.jpg";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    fetch('/api/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          navigate('/');
        }
      })
      .catch(err => console.error('Failed to check session:', err));
  }, [navigate]);

  const handleSteamLogin = () => {
    window.location.href = '/auth/steam';
  };

  const benefits = [
    {
      icon: Trophy,
      title: "Participe de Campeonatos",
      description: "Entre nas competições oficiais e dispute prêmios"
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Conecte-se com milhares de pilotos apaixonados"
    },
    {
      icon: Calendar,
      title: "Eventos Exclusivos",
      description: "Acesse corridas especiais e torneios únicos"
    },
    {
      icon: Shield,
      title: "Perfil Verificado",
      description: "Mostre seu status e conquistas na plataforma"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Gradient Overlay */}
      <div className="hero-overlay absolute inset-0" />

      {/* Content */}
      <div className="container relative flex min-h-screen items-center justify-center py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Side - Benefits */}
          <div className="flex flex-col justify-center animate-fade-in">
            <div className="mb-8">
              <Badge className="mb-4 inline-flex items-center gap-2 bg-primary/20 text-primary border-primary/30">
                <Star className="h-3 w-3" />
                Junte-se à Elite
              </Badge>
              <h1 className="mb-4 font-heading text-4xl font-black leading-tight md:text-5xl">
                <span className="text-primary">ACELERE</span>
                <br />
                <span className="text-foreground">SUA CARREIRA</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Entre na maior comunidade brasileira de sim racing.
                Compita, conquiste e conecte-se com os melhores pilotos do país.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background/10 backdrop-blur-sm border border-border/20 animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <benefit.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">10K+ Pilotos</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">50+ Campeonatos</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Ao Vivo</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="w-full max-w-md bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-heading">Bem-vindo de Volta</CardTitle>
                <CardDescription className="text-base">
                  Faça login com Steam e desbloqueie todo o potencial da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleSteamLogin}
                  className="w-full bg-[#171A21] hover:bg-[#2A475E] text-white border-0 h-12 text-base font-medium"
                  size="lg"
                >
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.15 2.57c.231-.285.481-.55.748-.79L4.89 9.91c.061-4.666 3.842-8.44 8.508-8.44 4.666 0 8.44 3.774 8.44 8.44 0 4.666-3.774 8.44-8.44 8.44-.231 0-.46-.01-.685-.03l-1.27 3.98c.365.052.737.08 1.115.08 6.301 0 11.469-4.86 11.957-11.037C23.448 4.86 18.28 0 11.979 0z"/>
                  </svg>
                  Continuar com Steam
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Ao fazer login, você concorda com nossos{" "}
                    <a href="#" className="text-primary hover:underline">Termos de Uso</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
