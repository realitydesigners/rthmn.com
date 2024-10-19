'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/utils/supabase/client';

export function AuthStatus() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getBrowserClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setStatus(user ? 'Authenticated' : 'Not authenticated');
    };

    checkAuth();
  }, []);

  return <div>Auth Status: {status}</div>;
}
