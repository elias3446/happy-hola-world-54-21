import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserCog } from 'lucide-react';

export const InitialSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { signUp, signOut, checkHasUsers } = useAuth();

  // Aplicar tema del sistema al cargar el componente y escuchar cambios
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      // Si no hay tema guardado o es 'system', aplicar tema del sistema
      if (!savedTheme || savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        
        // Si no había tema guardado, establecer 'system' como predeterminado
        if (!savedTheme) {
          localStorage.setItem('theme', 'system');
        }
        
        console.log('InitialSetup: Applied system theme:', systemTheme);
      } else {
        // Si hay un tema específico guardado, aplicarlo
        root.classList.add(savedTheme);
        console.log('InitialSetup: Applied saved theme:', savedTheme);
      }
    };

    // Aplicar tema inicial
    applyTheme();

    // Solo escuchar cambios del sistema si el tema guardado es 'system'
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme || savedTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const currentSavedTheme = localStorage.getItem('theme');
        // Solo aplicar cambios si el tema actual sigue siendo 'system'
        if (!currentSavedTheme || currentSavedTheme === 'system') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(e.matches ? 'dark' : 'light');
          console.log('InitialSetup: System theme changed to:', e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, []);

  const getErrorMessage = (error: any) => {
    if (!error?.message) return "Ocurrió un error inesperado";
    
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('user already registered')) {
      return "Ya existe una cuenta con este email. Intenta iniciar sesión en su lugar.";
    }
    
    if (errorMessage.includes('password should be at least')) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    
    if (errorMessage.includes('signup is disabled')) {
      return "El registro está deshabilitado en este momento.";
    }
    
    if (errorMessage.includes('invalid email')) {
      return "El formato del email no es válido.";
    }
    
    if (errorMessage.includes('weak password')) {
      return "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
    }
    
    return error.message || "Error durante el registro. Intenta nuevamente.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Limpiar cualquier sesión existente antes de crear el nuevo usuario
      await signOut();

      // Crear el nuevo usuario administrador
      const { error } = await signUp(email, password, firstName, lastName, 'admin');
      
      if (error) {
        toast({
          title: "Error en el registro",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "Tu cuenta de administrador ha sido creada. Ahora puedes iniciar sesión.",
        });
        
        // Activar estado de redirección
        setRedirecting(true);
        
        // Cerrar la sesión automáticamente para que aparezca el login
        setTimeout(async () => {
          await signOut();
          checkHasUsers(); // Esto actualizará el estado y mostrará el login
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserCog className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Configuración Inicial</CardTitle>
          <CardDescription>
            Bienvenido! Crea tu cuenta de administrador para comenzar a usar la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Tu nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading || redirecting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Tu apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading || redirecting}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || redirecting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading || redirecting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading || redirecting}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || redirecting}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : redirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirigiendo al login...
                </>
              ) : (
                'Crear Cuenta de Administrador'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
