'use client';

import { createClient } from '@/utils/supabase/client';
import { FaDiscord } from 'react-icons/fa';
import { useState } from 'react';
import { Database } from '@/types/supabase';
import Card from '@/components/Card';
import Button from '@/components/Button';

type DiscordConnection =
  Database['public']['Tables']['discord_connections']['Row'];

const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!)}&response_type=code&scope=identify`;

export default function DiscordConnectionForm({
  discordConnection,
  subscription
}: {
  discordConnection: DiscordConnection | null;
  subscription: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);

      await fetch('/api/discord/disconnect', {
        method: 'POST',
        body: JSON.stringify({
          discord_user_id: discordConnection?.discord_user_id
        })
      });

      await supabase
        .from('discord_connections')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting Discord:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      title="Discord Connection"
      description={
        discordConnection
          ? `Connected as ${discordConnection.discord_username}`
          : 'Connect your Discord account to access the community.'
      }
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="pb-4 sm:pb-0">
            {subscription && !discordConnection
              ? 'Please connect Discord to access community channels.'
              : 'Manage your Discord connection.'}
          </p>
          {discordConnection ? (
            <Button
              variant="slim"
              onClick={handleDisconnect}
              loading={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Disconnect Discord
            </Button>
          ) : (
            <Button
              variant="slim"
              onClick={() => (window.location.href = DISCORD_OAUTH_URL)}
            >
              <div className="flex items-center gap-2">
                <FaDiscord className="h-5 w-5" />
                Connect Discord
              </div>
            </Button>
          )}
        </div>
      }
    >
      <div className="mb-4 mt-8 text-xl font-semibold">
        {subscription
          ? discordConnection
            ? 'Discord Connected'
            : 'Discord Not Connected'
          : 'Subscribe to access Discord community'}
      </div>
    </Card>
  );
}
