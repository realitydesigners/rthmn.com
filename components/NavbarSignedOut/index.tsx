import { getServerClient } from '@/utils/supabase/server';
import { Navbar } from './Navbar';

export async function NavbarSignedOut() {
  const supabase = getServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  console.log(
    'NavbarSignedOut - User state:',
    user ? 'Authenticated' : 'Not authenticated'
  );

  return <Navbar user={user} />;
}
