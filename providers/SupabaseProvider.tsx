'use client';

import {
  createClientComponentClient,
  Session
} from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState, useEffect, createContext, useContext } from 'react';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';

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
  initialSession
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [supabaseClient] = useState(() =>
    createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    })
  );
  const [session, setSession] = useState<Session | null>(initialSession);
  const router = useRouter();

  useEffect(() => {
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
  }, [supabaseClient, router]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/');
  };

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={session}
    >
      <AuthContext.Provider value={{ session, signOut }}>
        {children}
      </AuthContext.Provider>
    </SessionContextProvider>
  );
}
