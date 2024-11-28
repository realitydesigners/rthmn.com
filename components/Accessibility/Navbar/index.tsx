'use client';
import { useAuth } from '@/providers/SupabaseProvider';
import { NavbarSignedIn } from '@/components/Accessibility/NavbarSignedIn';
import { NavbarSignedOut } from './NavbarSignedOut';
import { QueryProvider } from '@/providers/QueryProvider';
import { WebSocketProvider } from '@/providers/WebsocketProvider';
import { DashboardProvider } from '@/providers/DashboardProvider';

export const Navbar = () => {
  const { user } = useAuth();

  if (!user) {
    return <NavbarSignedOut user={null} />;
  }

  return (
    <QueryProvider>
      <WebSocketProvider>
        <DashboardProvider>
          <NavbarSignedIn user={user} />
        </DashboardProvider>
      </WebSocketProvider>
    </QueryProvider>
  );
};
