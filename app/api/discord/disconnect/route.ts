import { NextResponse } from 'next/server';
import { getDiscordClient } from '@/utils/discord/client';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const discord = await getDiscordClient();
        const { discord_user_id } = await request.json();

        const guild = await discord.guilds.fetch(process.env.DISCORD_GUILD_ID!);
        const member = await guild.members.fetch(discord_user_id);

        // Remove both roles when disconnecting
        await Promise.all([member.roles.remove(process.env.DISCORD_PAID_ROLE_ID!), member.roles.remove(process.env.DISCORD_UNPAID_ROLE_ID!)]);

        console.log('Removed Discord roles for user:', discord_user_id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing Discord roles:', error);
        return NextResponse.json({ error: 'Failed to remove Discord roles' }, { status: 500 });
    }
}
