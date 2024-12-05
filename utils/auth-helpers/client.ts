'use client';

import type { Provider } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

export function useSignInWithOAuth() {
  const supabase = createClient();

  return async (e: React.FormEvent<HTMLFormElement>, provider: Provider) => {
    e.preventDefault();
    const redirectURL =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://www.rthmn.com';

    if (provider === 'discord') {
      // Add discord-specific scopes
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
          scopes: 'identify' // Add any additional scopes you need
        }
      });
    } else {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL
        }
      });
    }
  };
}
