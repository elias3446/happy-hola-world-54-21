
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  FileText, 
  Map, 
  User, 
  Settings, 
  Menu, 
  Users, 
  Shield,
  LogOut,
  Bot
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';

const MainNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { hasPermission, isAdmin } = useSecurity();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navigationItems = [
    {
      label: 'Inicio',
      href: '/home',
      icon: Home,
      permission: null
    },
    {
      label: 'Reportes Públicos',
      href: '/reportes-publicos',
      icon: FileText,
      permission: null
    },
    {
      label: 'Mapa',
      href: '/mapa-reportes', 
      icon: Map,
      permission: null
    },
    {
      label: 'Asistente Virtual',
      href: '/asistente',
      icon: Bot,
      permission: null
    },
    {
      label: 'Administración',
      href: '/admin',
      icon: Settings,
      permission: 'ver_usuario',
      adminOnly: true
    },
  ];

  const filteredItems = navigationItems.filter(item => {
    if (item.adminOnly && !isAdmin()) return false;
    if (item.permission && !hasPermission(item.permission as any)) return false;
    return true;
  });

  const isActive = (href: string) => {
    if (href === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const NavItems = ({ mobile = false }) => (
    <>
      {filteredItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={mobile ? () => setIsOpen(false) : undefined}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
              mobile && "w-full"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl">Reportes</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavItems />
          </div>

          {/* Right side - User menu and theme toggle */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* User menu */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/mi-perfil"
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === '/mi-perfil'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-4">
                    <div className="text-lg font-semibold">Navegación</div>
                    
                    <div className="space-y-2">
                      <NavItems mobile />
                      
                      <div className="border-t pt-2 mt-4">
                        <Link
                          to="/mi-perfil"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full",
                            location.pathname === '/mi-perfil'
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          <User className="h-4 w-4" />
                          <span>Mi Perfil</span>
                        </Link>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Salir
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
