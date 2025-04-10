import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase'; // Import the initialized Supabase client

// Define the shape of the context state using Supabase types
interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean; // To handle initial auth state loading and session fetching
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    // Attempt to get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session fetched:', session ? session.user.id : 'null');
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch((error) => {
        console.error('[AuthContext] Error fetching initial session:', error);
        setIsLoading(false);
    });

    // Listen for auth state changes (SIGNED_IN, SIGNED_OUT, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`[AuthContext] Auth state changed: ${_event}`, session ? session.user.id : 'null');
      setSession(session);
      setUser(session?.user ?? null);
      // No need to setIsLoading here as initial load is handled above
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // --- Authentication Functions using Supabase ---

  const signIn = useCallback(async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email, password: pass });
    if (error) {
      console.error('[AuthContext] Supabase sign in failed:', error.message);
      throw error; // Rethrow for UI handling
    }
    console.log('[AuthContext] Supabase sign in successful (listener will update state).');
    // The onAuthStateChange listener will update the user/session state
  }, []);

  const signUp = useCallback(async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({ email: email, password: pass });
    // Note: Supabase requires email confirmation by default unless disabled in settings.
    if (error) {
      console.error('[AuthContext] Supabase sign up failed:', error.message);
      throw error;
    }
    if (!data.session && data.user) {
        // If session is null but user exists, likely means email confirmation is pending
        console.log('[AuthContext] Supabase sign up successful, pending email confirmation.');
        // You might want to show a message to the user here
        alert('Sign up successful! Please check your email to confirm your account.');
    } else {
        console.log('[AuthContext] Supabase sign up successful (listener will update state).');
    }
    // The onAuthStateChange listener will handle SignedIn event if confirmation isn't required or after confirmation
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AuthContext] Supabase sign out failed:', error.message);
      throw error;
    }
    console.log('[AuthContext] Supabase sign out successful (listener will update state).');
    // Listener updates state to null
  }, []);

  // Memoize the context value
  const value = useMemo(() => ({
    user,
    session, // Include session if needed by components
    isLoading,
    signIn,
    signUp,
    signOut,
  }), [user, session, isLoading, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 