'use client';

import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type AuthContextType = {
  session: Session | null;
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
  const router = useRouter();

  useEffect(() => {
    // Set initial session if user exists
    if (initialUser) {
      setSession({ user: initialUser } as Session);
    }

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`Supabase auth event: ${event}`);
        setSession(currentSession);
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseClient, router, initialUser]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ session, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
