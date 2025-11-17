require('dotenv').config();
const axios = require('axios');

const config = {
    jellyfinServerUrl: process.env.JELLYFIN_SERVER_URL || 'http://localhost:8096',
    jellyfinApiKey: process.env.JELLYFIN_API_KEY
};

if (!config.jellyfinApiKey) {
    console.error('ERROR: JELLYFIN_API_KEY is required in .env file');
    process.exit(1);
}

async function getUsers() {
    const endpoints = [
        '/Users',
        '/emby/Users',
        'Users'
    ];

    const authHeaders = [
        {
            'X-Emby-Authorization': `MediaBrowser Client="Jellyfin Mobile RPC", Device="PC", DeviceId="rpc-client", Version="1.0.0", Token="${config.jellyfinApiKey}"`,
            'X-Emby-Token': config.jellyfinApiKey
        },
        {
            'Authorization': `MediaBrowser Token="${config.jellyfinApiKey}"`,
            'X-Emby-Token': config.jellyfinApiKey
        },
        {
            'X-Emby-Token': config.jellyfinApiKey
        }
    ];

    const baseUrl = config.jellyfinServerUrl.replace(/\/$/, '');

    for (const endpoint of endpoints) {
        for (const headers of authHeaders) {
            try {
                const url = `${baseUrl}/${endpoint}`;
                console.log(`🔍 Trying: ${url}`);

                const response = await axios.get(url, { headers });

                console.log(`✅ Success! Using endpoint: ${endpoint}`);
                return response.data;
            } catch (error) {
                if (error.response) {
                    if (error.response.status !== 404) {
                        console.log(`   Status: ${error.response.status} - ${error.response.statusText}`);
                    }
                }
            }
        }
    }

    console.error('\n❌ All endpoint attempts failed.');
    console.error(`\n📋 Configuration:`);
    console.error(`   Server URL: ${config.jellyfinServerUrl}`);
    console.error(`   API Key: ${config.jellyfinApiKey.substring(0, 10)}...`);
    console.error(`\n💡 Troubleshooting:`);
    console.error(`   1. Verify JELLYFIN_SERVER_URL is correct (e.g., http://localhost:8096 or https://your-server.com)`);
    console.error(`   2. Check that your Jellyfin server is accessible`);
    console.error(`   3. Verify JELLYFIN_API_KEY is correct`);
    console.error(`   4. Try accessing ${baseUrl}/web/index.html in a browser to verify server is running`);

    return [];
}

async function getSessions() {
    const endpoints = [
        '/Sessions',
        '/emby/Sessions',
        'Sessions'
    ];

    const authHeaders = [
        {
            'X-Emby-Authorization': `MediaBrowser Client="Jellyfin Mobile RPC", Device="PC", DeviceId="rpc-client", Version="1.0.0", Token="${config.jellyfinApiKey}"`,
            'X-Emby-Token': config.jellyfinApiKey
        },
        {
            'Authorization': `MediaBrowser Token="${config.jellyfinApiKey}"`,
            'X-Emby-Token': config.jellyfinApiKey
        },
        {
            'X-Emby-Token': config.jellyfinApiKey
        }
    ];

    const baseUrl = config.jellyfinServerUrl.replace(/\/$/, '');

    for (const endpoint of endpoints) {
        for (const headers of authHeaders) {
            try {
                const url = `${baseUrl}/${endpoint}`;
                const response = await axios.get(url, { headers });
                return response.data;
            } catch (error) {
            }
        }
    }

    return [];
}

async function main() {
    console.log('🔍 Fetching Jellyfin users...\n');
    console.log(`📡 Server URL: ${config.jellyfinServerUrl}\n`);

    const users = await getUsers();

    if (users.length === 0) {
        console.log('\n❌ No users found. Check your API key and server URL.');
        process.exit(1);
    }

    console.log('📋 Available Users:\n');
    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.Name}`);
        console.log(`   User ID: ${user.Id}`);
        console.log(`   Username: ${user.Name}`);
        if (user.LastActivityDate) {
            console.log(`   Last Activity: ${new Date(user.LastActivityDate).toLocaleString()}`);
        }
        console.log('');
    });

    console.log('🔍 Checking active sessions...\n');
    const sessions = await getSessions();

    if (sessions.length > 0) {
        console.log(`📊 Found ${sessions.length} active session(s):\n`);
        sessions.forEach((session, index) => {
            console.log(`${index + 1}. User: ${session.UserName || 'Unknown'} (${session.UserId})`);
            console.log(`   Device: ${session.DeviceName || 'Unknown'}`);
            console.log(`   Client: ${session.Client || 'Unknown'}`);
            if (session.NowPlayingItem) {
                console.log(`   Now Playing: ${session.NowPlayingItem.Name || 'Unknown'}`);
            }
            console.log('');
        });
    } else {
        console.log('No active sessions found.\n');
    }

    console.log('💡 Copy the User ID (UUID format) and paste it into your .env file as JELLYFIN_USER_ID');
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
