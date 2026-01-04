import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Menu, X, User } from "lucide-react";
import { Link } from "react-router-dom";
import { apiGet } from '@/lib/api';

interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  role: 'admin' | 'user' | 'premium';
  avatar?: string;
}

interface SessionResponse {
  user: User | null;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiGet<SessionResponse>('/api/session');
        if(data.user) {
          // Load full user data with avatar and details
          const fullData = await apiGet<SessionResponse>('/api/user/full');
          setUser(fullData.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };
    
    loadUser();
    
    // Also check for updates when page gains focus (user comes back from login)
    const handleFocus = () => loadUser();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Notícias", href: "/news" },
    { label: "Corridas", href: "/races" },
    { label: "Classificação", href: "/standings" },
    { label: "Sobre", href: "/about" },
    { label: "Contato", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brasil" />
      
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Flag className="h-5 w-5 text-secondary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold">
            BRASIL <span className="text-primary">SIM</span> RACING
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => (
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            )
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center gap-3">
              <Button variant="hero" size="default" asChild>
                <a href="/profile">
                  <User className="h-4 w-4" />
                  PAINEL
                </a>
              </Button>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.displayName || user.username}
                  className="h-8 w-8 rounded-full border-2 border-primary"
                />
              )}
            </div>
          ) : (
            <Button variant="hero" size="default" asChild>
              <Link to="/login">
                <User className="h-4 w-4" />
                ENTRAR
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="container flex flex-col gap-4 py-6">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              )
            ))}
            {user ? (
              <div className="mt-4 flex items-center gap-3">
                <Button variant="hero" size="lg" asChild>
                  <a href="/profile">
                    <User className="h-4 w-4" />
                    PAINEL
                  </a>
                </Button>
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.displayName || user.username}
                    className="h-8 w-8 rounded-full border-2 border-primary"
                  />
                )}
              </div>
            ) : (
              <Button variant="hero" size="lg" className="mt-4" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <User className="h-4 w-4" />
                  ENTRAR
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
