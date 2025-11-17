require('dotenv').config();

const config = {
    discordClientId: process.env.DISCORD_CLIENT_ID,
    jellyfinServerUrl: process.env.JELLYFIN_SERVER_URL || 'http://localhost:8096',
    jellyfinUserId: process.env.JELLYFIN_USER_ID,
    jellyfinApiKey: process.env.JELLYFIN_API_KEY,
    updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 5000,
    useSelfbot: process.env.USE_SELFBOT === 'true',
    selfbotToken: process.env.SELFBOT_TOKEN
};


if (!config.jellyfinUserId || !config.jellyfinApiKey) {
    console.error('ERROR: JELLYFIN_USER_ID and JELLYFIN_API_KEY are required in .env file');
    process.exit(1);
}

if (config.useSelfbot) {
    if (!config.selfbotToken) {
        console.error('ERROR: SELFBOT_TOKEN is required when USE_SELFBOT=true');
        console.error('💡 Set SELFBOT_TOKEN in your .env file with your Discord user token');
        process.exit(1);
    }
    console.log('🤖 Selfbot mode enabled - Discord Desktop does not need to be running');
} else {
    
    if (!config.discordClientId) {
        console.error('ERROR: DISCORD_CLIENT_ID is required in .env file (or enable USE_SELFBOT=true)');
        console.error('💡 Create a .env file based on env.example and add your Discord Client ID');
        console.error('💡 Get your Client ID from: https://discord.com/developers/applications');
        console.error('💡 Make sure you copy the "Application ID" (not the Client Secret)');
        process.exit(1);
    }

    if (!/^\d+$/.test(config.discordClientId)) {
        console.error('ERROR: DISCORD_CLIENT_ID appears to be invalid (should be a numeric string)');
        console.error(`   Current value: ${config.discordClientId}`);
        console.error('💡 Get your Client ID from: https://discord.com/developers/applications');
        console.error('💡 Make sure you copy the "Application ID" (not Client Secret)');
        process.exit(1);
    }
}

module.exports = config;
