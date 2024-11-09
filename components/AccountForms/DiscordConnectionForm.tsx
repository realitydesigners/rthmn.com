'use client';

import { createClient } from '@/utils/supabase/client';
import { FaDiscord, FaLink, FaUnlink } from 'react-icons/fa';
import { useState } from 'react';
import { Database } from '@/types/supabase';

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
<<<<<<< HEAD
    <div className="rounded-lg border border-[#333] bg-gradient-to-b from-[#0A0A0A] to-[#181818] p-6">
=======
    <div className="rounded-lg border border-[#333] bg-gradient-to-b from-[#0A0A0A] to-[#181818] p-6 font-outfit">
>>>>>>> 1293c3e (reimagined)
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FaDiscord className="h-5 w-5 text-[#5865F2]" />
<<<<<<< HEAD
            <h3 className="font-russo text-base font-medium text-white">
              Discord Connection
            </h3>
          </div>
          <p className="mt-1 font-outfit text-sm text-zinc-400">
=======
            <h3 className="font-outfit text-lg font-medium text-white">
              Discord Connection
            </h3>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
>>>>>>> 1293c3e (reimagined)
            {discordConnection
              ? `Connected as ${discordConnection.discord_username}`
              : 'Connect your Discord account'}
          </p>
        </div>
        <div>
          {discordConnection ? (
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full bg-gradient-to-b from-red-600 to-red-700 p-[2px] text-white transition-all duration-200 hover:from-red-500 hover:to-red-600 disabled:opacity-50"
            >
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-6 py-2">
                <FaUnlink className="h-4 w-4" />
<<<<<<< HEAD
                <span className="font-outfit text-sm">
=======
                <span className="font-outfit">
>>>>>>> 1293c3e (reimagined)
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => (window.location.href = DISCORD_OAUTH_URL)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#5865F2] to-[#4752C4] p-[2px] text-white transition-all duration-200 hover:from-[#4752C4] hover:to-[#3442A8]"
            >
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-6 py-2">
                <FaDiscord className="h-4 w-4" />
<<<<<<< HEAD
                <span className="font-outfit text-sm">Connect</span>
=======
                <span className="font-outfit">Connect</span>
>>>>>>> 1293c3e (reimagined)
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
