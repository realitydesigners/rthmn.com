import { NextResponse } from 'next/server';
import { getDiscordClient } from '@/utils/discord/client';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    console.log('==== DISCORD CALLBACK STARTED ====');
    console.log('Request URL:', request.url);

    try {
        const { searchParams, origin } = new URL(request.url);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        console.log('Origin:', origin);

        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
            console.error('Discord OAuth Error:', error, errorDescription);
            return NextResponse.redirect(`${origin}/account?error=oauth_${error}`);
        }

        if (!code) {
            console.log('No code provided in callback');
            return NextResponse.redirect(`${origin}/account?error=no_code`);
        }

        const supabase = await createClient();
        console.log('Starting Discord connection process...');
        console.log('Environment variables check:', {
            hasClientId: !!process.env.DISCORD_CLIENT_ID,
            hasClientSecret: !!process.env.DISCORD_CLIENT_SECRET,
            hasRedirectUri: !!process.env.DISCORD_REDIRECT_URI,
            hasGuildId: !!process.env.DISCORD_GUILD_ID,
            hasPaidRoleId: !!process.env.DISCORD_PAID_ROLE_ID,
            hasUnpaidRoleId: !!process.env.DISCORD_UNPAID_ROLE_ID,
        });

        const discord = await getDiscordClient();
        console.log('Discord client initialized');
        const user = await supabase.auth.getUser();
        console.log('Got Supabase user:', user.data.user?.id);

        // Exchange code for Discord token and get user info
        console.log('Attempting to exchange code for Discord token...');
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.DISCORD_REDIRECT_URI!,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return NextResponse.redirect(`${origin}/account?error=token_exchange_failed`);
        }

        const tokenData = await tokenResponse.json();
        console.log('Successfully obtained Discord token');
        const { access_token } = tokenData;

        console.log('Fetching Discord user info...');
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.text();
            console.error('User info fetch failed:', errorData);
            return NextResponse.redirect(`${origin}/account?error=user_info_failed`);
        }

        const discordUser = await userResponse.json();
        console.log('Got Discord user info:', discordUser.id, discordUser.username);

        // Store Discord connection
        console.log('Storing Discord connection in database...');
        try {
            await supabase.from('discord_connections').upsert({
                user_id: user.data.user?.id,
                discord_user_id: discordUser.id,
                discord_username: discordUser.username,
            });
            console.log('Successfully stored Discord connection');
        } catch (dbError) {
            console.error('Database storage failed:', dbError);
            return NextResponse.redirect(`${origin}/account?error=database_storage_failed`);
        }

        // Add appropriate role immediately
        console.log('Fetching Discord guild...');
        let guild;
        try {
            guild = await discord.guilds.fetch(process.env.DISCORD_GUILD_ID!);
            console.log('Successfully fetched guild:', guild.name);
        } catch (guildError) {
            console.error('Guild fetch failed:', guildError);
            return NextResponse.redirect(`${origin}/account?error=guild_fetch_failed`);
        }

        let member;
        console.log('Attempting to fetch guild member...');
        try {
            member = await guild.members.fetch(discordUser.id);
            console.log('Successfully fetched existing guild member');
        } catch (error) {
            console.log('Member not found in guild, attempting to add...');
            try {
                member = await guild.members.add(discordUser.id, {
                    accessToken: access_token,
                });
                console.log('Successfully added member to guild');
            } catch (addError) {
                console.error('Failed to add member to guild:', addError);
                return NextResponse.redirect(`${origin}/account?error=discord_join_failed`);
            }
        }

        // Check subscription status
        console.log('Checking subscription status...');
        const { data: subscription, error: subError } = await supabase.from('subscriptions').select('*').in('status', ['trialing', 'active']).single();

        if (subError) {
            console.error('Subscription check failed:', subError);
        }
        console.log('Subscription status:', subscription ? 'active' : 'inactive');

        try {
            if (subscription) {
                console.log('Adding paid role...');
                await member.roles.add(process.env.DISCORD_PAID_ROLE_ID!);
                console.log('Added paid role for new connection');
            } else {
                console.log('Adding unpaid role...');
                await member.roles.add(process.env.DISCORD_UNPAID_ROLE_ID!);
                console.log('Added unpaid role for new connection');
            }
        } catch (roleError) {
            console.error('Failed to add role:', roleError);
            return NextResponse.redirect(`${origin}/account?error=discord_role_failed`);
        }

        console.log('Discord connection process completed successfully');
        return NextResponse.redirect(`${origin}/account?success=discord_connected`);
    } catch (error) {
        console.error('Top level error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.redirect(`${origin}/account?error=initial_setup_failed`);
    }
}
