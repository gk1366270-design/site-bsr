import { Flag, Youtube, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const links = {
    plataforma: ["Campeonatos", "Corridas", "Ranking", "Equipes"],
    recursos: ["Como Funciona", "Regras", "FAQ", "Suporte"],
    comunidade: ["Discord", "Fórum", "Eventos", "Parceiros"],
  };

  const socials = [
    { icon: Youtube, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Twitter, href: "#" },
  ];

  return (
    <footer className="border-t border-border/50 bg-card/30 py-16">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Flag className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="font-heading text-lg font-bold">
                BRASIL <span className="text-primary">SIM</span> RACING
              </span>
            </a>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              A maior comunidade brasileira de simuladores de corrida. Junte-se a
              milhares de pilotos virtuais apaixonados por velocidade.
            </p>
            <div className="flex gap-4">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-3">
              {links.plataforma.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider">
              Recursos
            </h4>
            <ul className="space-y-3">
              {links.recursos.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider">
              Comunidade
            </h4>
            <ul className="space-y-3">
              {links.comunidade.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Brasil Sim Racing. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Termos de Uso
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
