import React from 'react';
import { NavbarSignedOut } from '@/components/NavbarSignedOut';
import { NavbarSignedIn } from '@/components/NavbarSignedIn';
import { getServerClient } from '@/utils/supabase/server';

const DynamicNavbar = async () => {
  const supabase = getServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  console.log(
    'DynamicNavbar - User state:',
    user ? 'Authenticated' : 'Not authenticated'
  );

  let hasSubscription = false;
  if (user) {
    const { data: subscriptionData, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscriptionData && !error) {
      hasSubscription = true;
    }
  }

  if (user) {
    return <NavbarSignedIn user={user} />;
  } else {
    return <NavbarSignedOut />;
  }
};

export default DynamicNavbar;
