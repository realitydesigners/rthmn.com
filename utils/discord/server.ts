import { createClient } from '@/utils/supabase/server';
import { getDiscordClient } from './client';
import { getDiscordConnection } from '@/utils/supabase/queries';

export async function manageDiscordAccess(
  stripeCustomerId: string,
  isActive: boolean
) {
  const supabase = await createClient();
  const discord = await getDiscordClient();

  try {
    // 1. Get user from stripe customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (!customer) {
      console.error('No customer found for stripe ID:', stripeCustomerId);
      return;
    }

    // 2. Get Discord connection using our query function
    const discordConnection = await getDiscordConnection(supabase);

    if (!discordConnection) {
      console.log('No Discord connection found for user');
      return;
    }

    // Debug logs
    console.log('Guild ID:', process.env.DISCORD_GUILD_ID);
    console.log('Paid Role ID:', process.env.DISCORD_PAID_ROLE_ID);
    console.log('Unpaid Role ID:', process.env.DISCORD_UNPAID_ROLE_ID);

    // 3. Get Discord guild and member
    const guild = await discord.guilds.fetch(process.env.DISCORD_GUILD_ID!);
    const member = await guild.members.fetch(discordConnection.discord_user_id);

    // Log member's current roles
    console.log(
      'Current member roles:',
      member.roles.cache.map((r) => r.name)
    );

    // 4. Manage roles based on subscription status
    if (isActive) {
      // Add paid role and remove unpaid role
      await Promise.all([
        member.roles
          .add(process.env.DISCORD_PAID_ROLE_ID!)
          .then(() => console.log('Added paid role')),
        member.roles
          .remove(process.env.DISCORD_UNPAID_ROLE_ID!)
          .then(() => console.log('Removed unpaid role'))
      ]);
    } else {
      // Remove paid role and add unpaid role
      await Promise.all([
        member.roles
          .remove(process.env.DISCORD_PAID_ROLE_ID!)
          .then(() => console.log('Removed paid role')),
        member.roles
          .add(process.env.DISCORD_UNPAID_ROLE_ID!)
          .then(() => console.log('Added unpaid role'))
      ]);
    }

    // Log final roles
    console.log(
      'Updated member roles:',
      member.roles.cache.map((r) => r.name)
    );

    console.log(
      `Successfully updated roles for Discord user ${discordConnection.discord_user_id} to ${
        isActive ? 'paid' : 'unpaid'
      }`
    );
  } catch (error) {
    console.error('Error managing Discord access:', error);
    // Log more error details
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}
