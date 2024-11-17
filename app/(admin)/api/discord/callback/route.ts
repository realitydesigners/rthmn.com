import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getDiscordClient } from '@/utils/discord/client';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/account?error=no_code`);
  }

  try {
    const discord = await getDiscordClient();
    const user = await supabase.auth.getUser();

    // Exchange code for Discord token and get user info
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DISCORD_REDIRECT_URI!
      })
    });

    const { access_token } = await tokenResponse.json();

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const discordUser = await userResponse.json();

    // Store Discord connection
    await supabase.from('discord_connections').upsert({
      user_id: user.data.user?.id,
      discord_user_id: discordUser.id,
      discord_username: discordUser.username
    });

    // Add appropriate role immediately
    const guild = await discord.guilds.fetch(process.env.DISCORD_GUILD_ID!);
    const member = await guild.members.fetch(discordUser.id);

    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['trialing', 'active'])
      .single();

    if (subscription) {
      await member.roles.add(process.env.DISCORD_PAID_ROLE_ID!);
      console.log('Added paid role for new connection');
    } else {
      await member.roles.add(process.env.DISCORD_UNPAID_ROLE_ID!);
      console.log('Added unpaid role for new connection');
    }

    return NextResponse.redirect(`${origin}/account?success=discord_connected`);
  } catch (error) {
    console.error('Discord connection error:', error);
    return NextResponse.redirect(
      `${origin}/account?error=discord_connection_failed`
    );
  }
}
