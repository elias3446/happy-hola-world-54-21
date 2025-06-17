
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { rateLimiter, validateEmail, validatePassword } from '@/utils/securityEnhancements';
import { toast } from '@/hooks/use-toast';

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

export const useSecureAuth = () => {
  const { signIn, signUp, signOut } = useAuth();
  const { logSecurityEvent } = useSecurity();
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);

  // Secure login with rate limiting and logging
  const secureSignIn = useCallback(async (email: string, password: string) => {
    const clientId = `login_${email}`;
    
    // Check rate limiting (5 attempts per 15 minutes)
    if (rateLimiter.isRateLimited(clientId, 5, 15 * 60 * 1000)) {
      await logSecurityEvent('LOGIN_RATE_LIMITED', `Too many login attempts for ${email}`);
      toast({
        title: 'Error',
        description: 'Too many login attempts. Please try again later.',
        variant: 'destructive',
      });
      return { error: { message: 'Rate limited' } };
    }

    // Validate email format
    if (!validateEmail(email)) {
      await logSecurityEvent('LOGIN_INVALID_EMAIL', `Invalid email format: ${email}`);
      return { error: { message: 'Invalid email format' } };
    }

    // Record attempt
    rateLimiter.recordAttempt(clientId);

    try {
      const result = await signIn(email, password);
      
      const attempt: LoginAttempt = {
        email,
        timestamp: Date.now(),
        success: !result.error
      };
      
      setLoginAttempts(prev => [...prev.slice(-9), attempt]);
      
      if (result.error) {
        await logSecurityEvent('LOGIN_FAILED', `Failed login attempt for ${email}`, {
          error: result.error.message
        });
      } else {
        await logSecurityEvent('LOGIN_SUCCESS', `Successful login for ${email}`);
      }
      
      return result;
    } catch (error) {
      await logSecurityEvent('LOGIN_ERROR', `Login error for ${email}`, { error });
      return { error };
    }
  }, [signIn, logSecurityEvent]);

  // Secure signup with validation
  const secureSignUp = useCallback(async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    // Validate email
    if (!validateEmail(email)) {
      await logSecurityEvent('SIGNUP_INVALID_EMAIL', `Invalid email format: ${email}`);
      return { error: { message: 'Invalid email format' } };
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      await logSecurityEvent('SIGNUP_WEAK_PASSWORD', `Weak password attempt for ${email}`);
      return { 
        error: { 
          message: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
        } 
      };
    }

    try {
      const result = await signUp(email, password, firstName, lastName);
      
      if (result.error) {
        await logSecurityEvent('SIGNUP_FAILED', `Failed signup attempt for ${email}`, {
          error: result.error.message
        });
      } else {
        await logSecurityEvent('SIGNUP_SUCCESS', `Successful signup for ${email}`);
      }
      
      return result;
    } catch (error) {
      await logSecurityEvent('SIGNUP_ERROR', `Signup error for ${email}`, { error });
      return { error };
    }
  }, [signUp, logSecurityEvent]);

  // Secure logout with logging
  const secureSignOut = useCallback(async () => {
    try {
      await logSecurityEvent('LOGOUT_INITIATED', 'User initiated logout');
      await signOut();
      await logSecurityEvent('LOGOUT_SUCCESS', 'User logged out successfully');
    } catch (error) {
      await logSecurityEvent('LOGOUT_ERROR', 'Error during logout', { error });
      throw error;
    }
  }, [signOut, logSecurityEvent]);

  return {
    secureSignIn,
    secureSignUp,
    secureSignOut,
    loginAttempts
  };
};
