import { QueryProvider } from '@/providers/QueryProvider';
import { SignalProvider } from '@/providers/SignalProvider';
import { WebSocketProvider } from '@/providers/WebSocketProvider';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // const supabase = await createClient();

  // const { data, error } = await supabase.auth.getUser();
  // if (error || !data?.user) {
  //   redirect('/signin');
  // }

  return (
    <QueryProvider>
      <SignalProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </SignalProvider>
    </QueryProvider>
  );
}
