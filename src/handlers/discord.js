const config = require('../config/config');
const DiscordClient = require('../discord/client');
const { getJellyfinUserSessions } = require('./jellyfin');
const { buildActivity } = require('./activity');

let discordClient = null;
let currentPresence = null;
let updateIntervalId = null;

async function updateDiscordPresence() {
    try {
        const sessions = await getJellyfinUserSessions();
        const activeSessions = sessions.filter(session =>
            session.NowPlayingItem &&
            session.PlayState
        );

        if (activeSessions.length === 0) {
            await discordClient.clearActivity();
            currentPresence = null;
            return;
        }

        // Check for mobile sessions first
        const mobileSession = activeSessions.find(session => {
            const deviceName = (session.DeviceName || '').toLowerCase();
            const clientName = (session.Client || '').toLowerCase();
            return deviceName.includes('mobile') ||
                   deviceName.includes('android') ||
                   deviceName.includes('ios') ||
                   deviceName.includes('iphone') ||
                   deviceName.includes('ipad') ||
                   clientName.includes('mobile') ||
                   clientName.includes('android') ||
                   clientName.includes('ios');
        });
        const session = mobileSession || activeSessions[0];

        if (!session.NowPlayingItem) {
            await discordClient.clearActivity();
            currentPresence = null;
            return;
        }

        const { activity, session: sessionData, isMobile, largeImageUrl } = buildActivity(session);

        await discordClient.setActivity(activity);
        currentPresence = activity;

        const deviceInfo = isMobile ? '📱 Mobile' : '💻 Desktop';

        if (largeImageUrl) {
            console.log(`Updated presence: ${activity.details} - ${activity.state} | ${deviceInfo} | Image: ${largeImageUrl.substring(0, 80)}...`);
        } else {
            console.log(`Updated presence: ${activity.details} - ${activity.state} | ${deviceInfo}`);
        }

    } catch (error) {
        console.error('Error updating Discord presence:', error.message);
    }
}

async function initializeDiscord() {
    // Verify user id
    const userIdFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userIdFormat.test(config.jellyfinUserId)) {
        console.warn('⚠️  WARNING: User ID does not look like a valid Jellyfin UUID (should be format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
        console.log('💡 To get your correct User ID, run: node src/utils/get-user-id.js');
    }

    // Test API connection
    console.log('🔍 Testing Jellyfin API connection...');
    const { getJellyfinSessions } = require('./jellyfin');
    const testSessions = await getJellyfinSessions();
    console.log(`✅ Found ${testSessions.length} active session(s) on server`);

    if (testSessions.length > 0) {
        const userSessions = testSessions.filter(s =>
            s.UserId && s.UserId.toLowerCase() === config.jellyfinUserId.toLowerCase()
        );
        console.log(`📊 Found ${userSessions.length} session(s) for your user ID`);

        if (userSessions.length === 0 && testSessions.length > 0) {
            console.log('\n⚠️  No sessions found for your User ID. Available User IDs in current sessions:');
            const uniqueUserIds = [...new Set(testSessions.map(s => s.UserId).filter(Boolean))];
            uniqueUserIds.forEach(id => console.log(`   - ${id}`));
            console.log('\n💡 Update JELLYFIN_USER_ID in your .env file with one of the above IDs');
        }
    }
    console.log('---');

    console.log(`📺 Monitoring Jellyfin for user: ${config.jellyfinUserId}`);
    console.log(`🔄 Update interval: ${config.updateInterval}ms`);
    console.log('---');

    await updateDiscordPresence();
    updateIntervalId = setInterval(updateDiscordPresence, config.updateInterval);
}

async function startDiscordConnection() {
    try {
        discordClient = new DiscordClient();
        await discordClient.connect();
        await initializeDiscord();
    } catch (error) {
        console.error('Failed to start Discord connection:', error.message);
        process.exit(1);
    }
}

function cleanup() {
    if (updateIntervalId) {
        clearInterval(updateIntervalId);
        updateIntervalId = null;
    }
    if (discordClient) {
        discordClient.disconnect();
        discordClient = null;
    }
}

module.exports = {
    startDiscordConnection,
    updateDiscordPresence,
    cleanup
};
