
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Menu,
  Home,
  Map,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Shield,
  FolderOpen,
  Circle,
  LogOut,
  User,
  UserCircle
} from 'lucide-react';
import { QuickReporteButton } from '@/components/reportes/QuickReporteButton';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const MainNavigation = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Obtener datos del perfil del usuario para mostrar el avatar
  const { data: perfilUsuario } = useQuery({
    queryKey: ['perfil-usuario-nav', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile for nav:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  // Función para obtener iniciales
  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Hook to detect screen size changes and close dropdowns
  useEffect(() => {
    const handleResize = () => {
      // Close user dropdown when screen size changes
      setUserDropdownOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const publicNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reportes-publicos', label: 'Ver Reportes', icon: FileText },
    { href: '/mapa-reportes', label: 'Mapa de Reportes', icon: Map },
  ];

  const MobileNavigation = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col space-y-4 mt-4">
          <div className="text-lg font-semibold">GeoReport</div>
          
          {/* Quick Actions - Solo mostrar si no es admin */}
          {user && !isAdmin() && (
            <div className="space-y-2 pb-2 border-b border-border">
              <QuickReporteButton />
            </div>
          )}
          
          {/* Navigation Links */}
          <div className="space-y-2">
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {user && (
            <>
              <hr className="border-border" />
              
              {/* Admin Link - Solo mostrar si es admin */}
              {isAdmin() && (
                <div className="space-y-2">
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === '/admin'
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Administración</span>
                  </Link>
                </div>
              )}

              <hr className="border-border" />
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-muted-foreground">Tema</span>
                <ThemeToggle />
              </div>

              <hr className="border-border" />
              
              {/* User Menu */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={perfilUsuario?.avatar || undefined} 
                      alt="Foto de perfil" 
                    />
                    <AvatarFallback>
                      {getInitials(perfilUsuario?.first_name, perfilUsuario?.last_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <Link
                  to="/mi-perfil"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>Mi Perfil</span>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </>
          )}

          {/* Theme toggle para usuarios no autenticados */}
          {!user && (
            <>
              <hr className="border-border" />
              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-muted-foreground">Tema</span>
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center max-w-full px-4">
        {/* Logo */}
        <div className="mr-4 hidden lg:flex shrink-0">
          <Link to="/home" className="flex items-center space-x-2">
            <Map className="h-6 w-6" />
            <span className="font-bold">GeoReport</span>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="mr-4 lg:hidden shrink-0">
          <Link to="/home" className="flex items-center space-x-2">
            <Map className="h-6 w-6" />
            <span className="font-bold">GeoReport</span>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-1 items-center justify-between min-w-0">
          <NavigationMenu className="max-w-none">
            <NavigationMenuList className="flex-wrap">
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "flex items-center space-x-2 text-sm",
                          isActive(item.href) && "bg-accent"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden xl:inline">{item.label}</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
              
              {/* Administración Link - Solo mostrar si es admin */}
              {user && isAdmin() && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/admin"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "flex items-center space-x-2 text-sm",
                        location.pathname === '/admin' && "bg-accent"
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden xl:inline">Administración</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            {/* Nuevo Reporte - Solo mostrar si no es admin */}
            {user && !isAdmin() && <QuickReporteButton />}
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 max-w-[200px] h-auto p-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={perfilUsuario?.avatar || undefined} 
                        alt="Foto de perfil" 
                      />
                      <AvatarFallback className="text-sm">
                        {getInitials(perfilUsuario?.first_name, perfilUsuario?.last_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate hidden md:inline ml-2">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/mi-perfil">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
