import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  MessageCircle,
  Instagram,
  Youtube,
  Twitter,
  Twitch,
  Send
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  const socialLinks = [
    {
      icon: <Instagram className="h-6 w-6" />,
      label: "Instagram",
      href: "https://instagram.com/brasilsimracing",
      color: "hover:text-pink-500"
    },
    {
      icon: <Youtube className="h-6 w-6" />,
      label: "YouTube",
      href: "https://youtube.com/brasilsimracing",
      color: "hover:text-red-500"
    },
    {
      icon: <Twitter className="h-6 w-6" />,
      label: "Twitter",
      href: "https://twitter.com/brasilsimracing",
      color: "hover:text-blue-400"
    },
    {
      icon: <Twitch className="h-6 w-6" />,
      label: "Twitch",
      href: "https://twitch.tv/brasilsimracing",
      color: "hover:text-purple-500"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      label: "Discord",
      href: "https://discord.gg/brasilsimracing",
      color: "hover:text-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Entre em Contato</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conecte-se conosco através das nossas redes sociais ou envie uma mensagem direta.
            Estamos sempre prontos para ajudar!
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Envie uma Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Seu nome completo" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" />
                </div>
                <div>
                  <Label htmlFor="subject">Assunto</Label>
                  <Input id="subject" placeholder="Assunto da mensagem" />
                </div>
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Digite sua mensagem aqui..."
                    rows={5}
                  />
                </div>
              </div>
              <Button className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Siga-nos nas redes sociais para ficar por dentro das últimas novidades,
                transmissões ao vivo e conteúdo exclusivo da comunidade.
              </p>

              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-accent ${social.color}`}
                  >
                    {social.icon}
                    <span className="font-medium">{social.label}</span>
                  </a>
                ))}
              </div>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">E-mail para Contato</h3>
                <a
                  href="mailto:contato@brasilsimracing.com.br"
                  className="text-primary hover:underline"
                >
                  contato@brasilsimracing.com.br
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Suporte</h3>
              <p className="text-sm text-muted-foreground">
                Dúvidas sobre inscrições, regras ou problemas técnicos
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Parcerias</h3>
              <p className="text-sm text-muted-foreground">
                Interessado em parcerias ou colaborações
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Send className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Imprensa</h3>
              <p className="text-sm text-muted-foreground">
                Contato para veículos de comunicação
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;