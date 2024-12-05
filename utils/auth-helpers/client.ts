'use client';

import type { Provider } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getURL } from '@/utils/helpers';

export function useSignInWithOAuth() {
  const supabase = createClient();

  return async (e: React.FormEvent<HTMLFormElement>, provider: Provider) => {
    e.preventDefault();
    const redirectURL = getURL();

    if (provider === 'discord') {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
          scopes: 'identify'
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
