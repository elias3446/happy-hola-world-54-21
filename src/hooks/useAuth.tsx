import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, roleType?: 'admin' | 'user') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  hasUsers: boolean | null;
  hasProfile: boolean | null;
  checkHasUsers: () => Promise<void>;
  checkUserProfile: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const checkHasUsers = async () => {
    try {
      console.log('Checking for existing users...');
      const { data, error } = await supabase.rpc('has_users');
      if (error) {
        console.error('Error checking for users:', error);
        return;
      }
      console.log('Has users result:', data);
      setHasUsers(data);
    } catch (error) {
      console.error('Error checking for users:', error);
    }
  };

  const checkUserProfile = async () => {
    if (!user) {
      setHasProfile(null);
      setUserProfile(null);
      return;
    }

    try {
      console.log('Checking if user has profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user profile:', error);
        return;
      }

      const userHasProfile = !!data;
      console.log('User has profile:', userHasProfile);
      setHasProfile(userHasProfile);
      setUserProfile(data);
    } catch (error) {
      console.error('Error checking user profile:', error);
    }
  };

  // Función para verificar si el usuario actual es admin
  const isAdmin = () => {
    if (!userProfile || !userProfile.role) return false;
    return userProfile.role.includes('admin');
  };

  const resendConfirmation = async (email: string) => {
    try {
      console.log('Resending confirmation email to:', email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Error resending confirmation:', error);
      } else {
        console.log('Confirmation email resent successfully');
      }
      
      return { error };
    } catch (error) {
      console.error('Error in resendConfirmation:', error);
      return { error };
    }
  };

  useEffect(() => {
    let mounted = true;

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Si se cierra sesión, limpiar estados inmediatamente
        if (event === 'SIGNED_OUT' || !session) {
          setHasProfile(null);
          setUserProfile(null);
          setLoading(false);
          
          setTimeout(() => {
            if (mounted) checkHasUsers();
          }, 0);
          return;
        }
        
        // Si se registra o inicia sesión exitosamente, verificar usuarios y perfil
        if (event === 'SIGNED_IN' && session) {
          setTimeout(() => {
            if (mounted) {
              checkHasUsers();
              checkUserProfile();
            }
          }, 0);
        }
        
        // Si hay token refresh, también verificar perfil
        if (event === 'TOKEN_REFRESHED' && session) {
          setTimeout(() => {
            if (mounted) checkUserProfile();
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Verificar sesión existente al iniciar la aplicación
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth - checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('Initial session check:', session);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Si hay sesión, verificar perfil
          if (session?.user) {
            setTimeout(() => {
              if (mounted) checkUserProfile();
            }, 0);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) setLoading(false);
      }
    };

    // Inicializar autenticación
    initializeAuth();

    // Verificar si existen usuarios al cargar
    checkHasUsers();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Verificar perfil cuando cambie el usuario
  useEffect(() => {
    if (user) {
      checkUserProfile();
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, roleType?: 'admin' | 'user') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Preparar metadatos del usuario con información de rol si se especifica
      const userData: any = {
        first_name: firstName,
        last_name: lastName,
      };

      // Si se especifica un tipo de rol, incluirlo en los metadatos
      if (roleType) {
        userData.role = roleType === 'admin' ? ['admin', 'user'] : ['user'];
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      await supabase.auth.signOut({ scope: 'global' });
      console.log('User signed out successfully');
      
      // Limpiar estados locales inmediatamente
      setSession(null);
      setUser(null);
      setHasProfile(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resendConfirmation,
      hasUsers,
      hasProfile,
      checkHasUsers,
      checkUserProfile,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
