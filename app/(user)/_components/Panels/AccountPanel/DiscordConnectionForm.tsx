'use client';

import { useState } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { Database } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';

type DiscordConnection = Database['public']['Tables']['discord_connections']['Row'];

// Get the base URL dynamically
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // For production, always use the non-www version
        if (window.location.hostname === 'www.rthmn.com') {
            return 'https://rthmn.com';
        }
        return window.location.origin;
    }
    // Default to the non-www version for production
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://rthmn.com';
};

// Use dynamic redirect URI based on environment
const DISCORD_OAUTH_URL =
    'https://discord.com/oauth2/authorize?' +
    new URLSearchParams({
        client_id: '1297321318030639114',
        redirect_uri: `${getBaseUrl()}/api/discord/callback`,
        response_type: 'code',
        scope: 'identify guilds.join',
    }).toString();

export default function DiscordConnectionForm({ discordConnection, subscription }: { discordConnection: DiscordConnection | null; subscription: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleDisconnect = async () => {
        try {
            setIsLoading(true);

            await fetch('/api/discord/disconnect', {
                method: 'POST',
                body: JSON.stringify({
                    discord_user_id: discordConnection?.discord_user_id,
                }),
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
        <div className='flex flex-col items-start justify-between gap-4'>
            <div className='flex items-center gap-3'>
                <div className='flex-shrink-0 rounded-md bg-white/5 p-2'>
                    <FaDiscord className='h-4 w-4 text-[#5865F2] sm:h-5 sm:w-5' />
                </div>
                <div className='min-w-0'>
                    <h3 className='font-outfit text-base font-semibold text-white sm:text-lg'>Discord Connection</h3>
                    <p className='font-outfit truncate text-xs text-zinc-400 sm:text-sm'>
                        {discordConnection ? `Connected as ${discordConnection.discord_username}` : 'Connect your Discord account'}
                    </p>
                </div>
            </div>

            {discordConnection ? (
                <button
                    onClick={handleDisconnect}
                    disabled={isLoading}
                    className='flex w-full items-center justify-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-red-500 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-50 sm:w-auto sm:px-6 sm:py-2'>
                    <span className='font-outfit text-xs sm:text-sm'>{isLoading ? 'Disconnecting...' : 'Disconnect'}</span>
                </button>
            ) : (
                <button
                    onClick={() => (window.location.href = DISCORD_OAUTH_URL)}
                    className='flex w-full items-center justify-center gap-2 rounded-full bg-[#5865F2] px-4 py-1.5 text-white transition-all duration-200 hover:bg-[#4752C4] sm:w-auto sm:px-6 sm:py-2'>
                    <span className='font-outfit text-xs sm:text-sm'>Connect Discord</span>
                </button>
            )}
        </div>
    );
}
