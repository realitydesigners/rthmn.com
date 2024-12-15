import { Client, GatewayIntentBits } from 'discord.js';

let discordClient: Client | null = null;

export async function getDiscordClient() {
    if (!discordClient) {
        discordClient = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
        });

        if (!discordClient.isReady()) {
            await discordClient.login(process.env.DISCORD_BOT_TOKEN);
        }
    }
    return discordClient;
}
