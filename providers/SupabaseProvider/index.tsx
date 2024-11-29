'use client';

import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function SupabaseProvider({
  children,
  initialUser
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [supabaseClient] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const router = useRouter();

  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        console.error('Error during sign out:', error);
        return;
      }

      // The onAuthStateChange listener will handle:
      // - Setting user to null
      // - Setting session to null
      // - Redirecting to home page
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  };

  useEffect(() => {
    if (initialUser) {
      setSession({ user: initialUser } as Session);
      setIsLoading(false);
    }

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_OUT') {
          // Handle sign out in one place
          router.push('/');
          router.refresh();
        }
      }
    );

    if (!initialUser) {
      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseClient, router, initialUser]);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
