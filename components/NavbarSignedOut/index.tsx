import { getServerClient } from '@/utils/supabase/server';
import { Navbar } from './Navbar';

export async function NavbarSignedOut() {
  const supabase = getServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return <Navbar user={user} />;
}
