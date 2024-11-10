import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Client } from 'discord.js';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const isDiscordSignIn =
    requestUrl.searchParams.get('discord-sign-in') === 'true';

  if (code) {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;

      // Check for existing accounts with same email
      if (data.user?.email) {
        const { data: existingUsers, error: userError } = await supabase
          .from('users')
          .select('id')
          .neq('id', data.user.id)
          .ilike('email', data.user.email)
          .single();

        if (existingUsers) {
          return NextResponse.redirect(
            `${requestUrl.origin}/auth-error?error=${encodeURIComponent(
              'An account with this email already exists. Please sign in using your original authentication method.'
            )}`
          );
        }
      }

      // If this was a Discord sign-in, handle the Discord connection
      if (isDiscordSignIn && data.user) {
        try {
          // Get Discord token and user info
          const tokenResponse = await fetch(
            'https://discord.com/api/oauth2/token',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.DISCORD_REDIRECT_URI!
              })
            }
          );

          if (!tokenResponse.ok) {
            throw new Error('Failed to get Discord token');
          }

          const { access_token } = await tokenResponse.json();
          const userResponse = await fetch(
            'https://discord.com/api/users/@me',
            {
              headers: { Authorization: `Bearer ${access_token}` }
            }
          );

          if (!userResponse.ok) {
            throw new Error('Failed to get Discord user info');
          }

          const discordUser = await userResponse.json();

          // Check if Discord account is already connected to another user
          const { data: existingConnection } = await supabase
            .from('discord_connections')
            .select('user_id')
            .eq('discord_user_id', discordUser.id)
            .neq('user_id', data.user.id)
            .single();

          if (existingConnection) {
            return NextResponse.redirect(
              `${requestUrl.origin}/auth-error?error=${encodeURIComponent(
                'This Discord account is already connected to another user.'
              )}`
            );
          }

          // Store Discord connection
          await supabase.from('discord_connections').upsert({
            user_id: data.user.id,
            discord_user_id: discordUser.id,
            discord_username: discordUser.username
          });

          // Add default unpaid role
          const discord = new Client({ intents: [] });
          await discord.login(process.env.DISCORD_BOT_TOKEN);
          const guild = await discord.guilds.fetch(
            process.env.DISCORD_GUILD_ID!
          );
          const member = await guild.members.fetch(discordUser.id);
          await member.roles.add(process.env.DISCORD_UNPAID_ROLE_ID!);
        } catch (discordError) {
          console.error('Discord connection error:', discordError);
          return NextResponse.redirect(
            `${requestUrl.origin}/auth-error?error=${encodeURIComponent(
              'Failed to connect Discord account. Please try again.'
            )}`
          );
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth-error?error=${encodeURIComponent(JSON.stringify(error))}`
      );
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
