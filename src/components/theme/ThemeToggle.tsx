
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Theme = 'dark' | 'light' | 'system';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      // Si hay un tema guardado, usarlo, sino usar 'system' por defecto
      return savedTheme || 'system';
    }
    return 'system';
  });

  // Función para obtener el tema del sistema
  const getSystemTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Función para aplicar el tema
  const applyTheme = (currentTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'dark' | 'light';
    
    if (currentTheme === 'system') {
      effectiveTheme = getSystemTheme();
    } else {
      effectiveTheme = currentTheme;
    }
    
    root.classList.add(effectiveTheme);
    
    console.log('Theme applied:', currentTheme, 'effective:', effectiveTheme);
  };

  // Aplicar tema inicial al cargar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Al inicio, si no hay tema guardado, establecer 'system' como predeterminado
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (!savedTheme) {
        localStorage.setItem('theme', 'system');
        setTheme('system');
      }
      applyTheme(theme);
    }
  }, []);

  // Aplicar tema cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      applyTheme(theme);
    }
  }, [theme]);

  // Escuchar cambios en las preferencias del sistema solo si el tema es 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Solo aplicar cambios si el tema actual es 'system'
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
        console.log('System theme changed to:', e.matches ? 'dark' : 'light');
      }
    };

    // Aplicar tema inicial del sistema
    applyTheme('system');
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    console.log('Theme changed to:', newTheme);
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border">
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Oscuro</span>
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('system')}
          className="cursor-pointer"
        >
          <span className="mr-2">💻</span>
          <span>Sistema</span>
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
