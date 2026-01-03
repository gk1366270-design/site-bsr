import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Users, Trophy, Target, Car, Calendar, Award, Globe, Heart, Shield, Star, Medal, Clock, Settings, Zap, BarChart2, MessageCircle, GitCompare, TrendingUp, LayoutGrid, Monitor, Gamepad, Headset, Video, Gift, DollarSign, TrendingDown, TrendingUp as TrendingUpIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

const About = () => {
  const [stats, setStats] = useState({
    accountsCount: 0,
    racesCount: 0,
    totalParticipants: 0,
    activeChampionships: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/stats');
        const data = await response.json();
        
        if (data.ok && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: <Flag className="h-8 w-8 text-primary" />,
      title: "Competições Oficiais",
      description: "Organizamos campeonatos oficiais com reconhecimento nacional.",
      details: "Mais de 50 campeonatos realizados"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Comunidade Ativa",
      description: "Pilotos registrados participam das nossas corridas mensalmente.",
      details: "Comunidade presente em todas as regiões do Brasil"
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Campeões Reconhecidos",
      description: "Nossos campeões são reconhecidos em todo o cenário nacional.",
      details: "Vários pilotos se tornaram profissionais"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Tecnologia Avançada",
      description: "Utilizamos as melhores ferramentas de sim racing disponíveis.",
      details: "Sistema de live timing e telemetria"
    }
  ];

  const timeline = [
    {
      year: "2018",
      title: "Fundação",
      description: "Um grupo de amigos apaixonados por sim racing decide criar uma comunidade organizada.",
      icon: <Heart className="h-6 w-6 text-red-500" />
    },
    {
      year: "2019",
      title: "Primeiro Campeonato",
      description: "Realizamos nosso primeiro campeonato oficial com 50 pilotos inscritos.",
      icon: <Trophy className="h-6 w-6 text-yellow-500" />
    },
    {
      year: "2020",
      title: "Expansão Nacional",
      description: "Atingimos 1.000 membros e nos tornamos a maior comunidade de sim racing do Brasil.",
      icon: <Globe className="h-6 w-6 text-blue-500" />
    },
    {
      year: "2021",
      title: "Tecnologia Própria",
      description: "Desenvolvemos nosso próprio sistema de live timing e gerenciamento.",
      icon: <Zap className="h-6 w-6 text-purple-500" />
    },
    {
      year: "2022",
      title: "Parcerias Profissionais",
      description: "Firmamos parcerias com equipes reais de automobilismo.",
      icon: <Shield className="h-6 w-6 text-green-500" />
    },
    {
      year: "2023",
      title: "Inovação Contínua",
      description: "Lançamos nosso sistema de transmissão ao vivo com múltiplas câmeras.",
      icon: <Video className="h-6 w-6 text-indigo-500" />
    },
    {
      year: "2024",
      title: "Liderança Consolidada",
      description: "Consolidamos nossa posição como a principal comunidade de sim racing.",
      icon: <Star className="h-6 w-6 text-orange-500" />
    }
  ];

  const teamMembers = [
    {
      name: "Carlos Rodrigues",
      role: "Fundador & CEO",
      bio: "Ex-piloto profissional, fundador da BSR com mais de 15 anos de experiência.",
      avatar: "👤"
    },
    {
      name: "Ana Silva",
      role: "Diretora de Operações",
      bio: "Responsável pela organização de eventos e gerenciamento da comunidade.",
      avatar: "👤"
    },
    {
      name: "Pedro Almeida",
      role: "Chefe de Tecnologia",
      bio: "Desenvolvedor do nosso sistema de live timing e plataformas digitais.",
      avatar: "👤"
    },
    {
      name: "Marina Costa",
      role: "Diretora de Marketing",
      bio: "Especialista em crescimento de comunidade e parcerias estratégicas.",
      avatar: "👤"
    }
  ];

  const faqItems = [
    {
      question: "Como posso me juntar à comunidade?",
      answer: "Basta se registrar no nosso site e participar dos nossos eventos. A participação é gratuita!"
    },
    {
      question: "Quais jogos são suportados?",
      answer: "Suportamos Assetto Corsa, Assetto Corsa Competizione, iRacing, rFactor 2 e F1 2023."
    },
    {
      question: "Preciso de equipamento profissional?",
      answer: "Não! Aceitamos pilotos de todos os níveis, desde iniciantes com controle até profissionais."
    },
    {
      question: "Como funcionam as premiações?",
      answer: "Nossos campeonatos principais oferecem premiações em dinheiro e produtos."
    }
  ];

  const testimonials = [
    {
      quote: "A BSR mudou minha vida no sim racing. Consegui evoluir de piloto amador para profissional.",
      author: "Lucas Fernandes, Campeão Endurance 2023",
      avatar: "👤"
    },
    {
      quote: "A comunidade é incrível! Encontrei amigos e melhorei minhas habilidades.",
      author: "Juliana Martins, Piloto GT3",
      avatar: "👤"
    },
    {
      quote: "A organização dos eventos é impecável. Nunca vi nada tão profissional.",
      author: "Rafael Souza, Comentarista",
      avatar: "👤"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 -z-10"></div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Brasil Sim Racing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            A maior e mais organizada comunidade de sim racing do Brasil, conectando pilotos virtuais
            apaixonados por velocidade, competição e tecnologia.
          </p>
          <Badge variant="secondary" className="text-sm">
            🏆 {stats.accountsCount}+ pilotos | 🎮 {stats.racesCount}+ eventos realizados | 💰 Premiações em breve
          </Badge>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">O que nos torna especiais</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{feature.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {feature.details}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-16">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="history">Nossa História</TabsTrigger>
              <TabsTrigger value="mission">Missão e Valores</TabsTrigger>
              <TabsTrigger value="team">Nossa Equipe</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Jornada da Brasil Sim Racing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Desde nossa fundação em 2018, temos crescido exponencialmente, sempre mantendo
                    nosso compromisso com a qualidade, profissionalismo e paixão pelo sim racing.
                  </p>

                  <div className="space-y-8">
                    {timeline.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">{item.year}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold mb-4">Nossa Evolução</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Membros</span>
                          <span>{stats.accountsCount}+</span>
                        </div>
                        <Progress value={Math.min(100, (stats.accountsCount / 100) * 100)} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Eventos Anuais</span>
                          <span>{stats.racesCount}+</span>
                        </div>
                        <Progress value={Math.min(100, (stats.racesCount / 20) * 100)} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Participações</span>
                          <span>{stats.totalParticipants}+</span>
                        </div>
                        <Progress value={Math.min(100, (stats.totalParticipants / 1000) * 100)} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mission">
              <div className="grid gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Nossa Missão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      <strong>Democratizar o acesso ao sim racing competitivo</strong> no Brasil, criando um ambiente
                      profissional e inclusivo para pilotos de todos os níveis.
                    </p>
                    <p>
                      Queremos ser a ponte entre o sim racing amador e o profissional, ajudando pilotos a
                      desenvolverem suas habilidades e alcançarem seus objetivos.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">Acessibilidade</Badge>
                      <Badge variant="secondary">Profissionalismo</Badge>
                      <Badge variant="secondary">Inovação</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Nossos Valores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h4 className="font-semibold">Integridade</h4>
                          <p className="text-sm text-muted-foreground">
                            Mantemos os mais altos padrões de fair play e transparência.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h4 className="font-semibold">Comunidade</h4>
                          <p className="text-sm text-muted-foreground">
                            Valorizamos cada membro e promovemos um ambiente acolhedor.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h4 className="font-semibold">Excelência</h4>
                          <p className="text-sm text-muted-foreground">
                            Buscamos constantemente superar expectativas e estabelecer novos padrões.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((member, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                          {member.avatar}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Statistics Section */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-12">Nossos Números</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stats.accountsCount}+</div>
                  <div className="text-sm text-muted-foreground">Pilotos Registrados</div>
                  <div className="text-xs text-muted-foreground mt-1">De iniciantes a profissionais</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stats.racesCount}+</div>
                  <div className="text-sm text-muted-foreground">Eventos Realizados</div>
                  <div className="text-xs text-muted-foreground mt-1">Corridas e campeonatos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stats.totalParticipants}+</div>
                  <div className="text-sm text-muted-foreground">Participações</div>
                  <div className="text-xs text-muted-foreground mt-1">Inscrições em eventos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stats.activeChampionships}+</div>
                  <div className="text-sm text-muted-foreground">Campeonatos Ativos</div>
                  <div className="text-xs text-muted-foreground mt-1">Competições em andamento</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">O que nossos membros dizem</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes</h2>
              <p className="text-muted-foreground mb-4">
                Tire suas dúvidas sobre como participar da nossa comunidade.
              </p>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Entre em Contato
              </Button>
            </div>
            <div>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-16">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Junte-se à maior comunidade de sim racing do Brasil!</h2>
              <p className="text-muted-foreground mb-6">
                Seja parte de uma comunidade apaixonada por velocidade e competição.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg">
                  <Car className="h-4 w-4 mr-2" />
                  Inscrever-se Agora
                </Button>
                <Button variant="outline" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Próximos Eventos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partners Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Parceiros</h2>
          <Card className="p-8">
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                <div className="text-center">
                  <div className="text-lg font-semibold text-muted-foreground">Logitech</div>
                  <div className="text-xs text-muted-foreground/70">Tecnologia em Periféricos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-muted-foreground">Thrustmaster</div>
                  <div className="text-xs text-muted-foreground/70">Equipamentos Profissionais</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-muted-foreground">Fanatec</div>
                  <div className="text-xs text-muted-foreground/70">Sim Racing Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-muted-foreground">Assetto Corsa</div>
                  <div className="text-xs text-muted-foreground/70">Simulador Oficial</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;