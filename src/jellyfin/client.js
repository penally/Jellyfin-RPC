const axios = require('axios');
const config = require('../config/config');

async function getJellyfinSessions() {
    const endpoints = ['/Sessions', '/emby/Sessions', 'Sessions'];

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

    // If all attempts failed
    console.error('Error: Could not connect to Jellyfin API. Check your server URL and API key.');
    return [];
}

async function getJellyfinUserSessions() {
    try {
        const allSessions = await getJellyfinSessions();

        const userSessions = allSessions.filter(session =>
            session.UserId && session.UserId.toLowerCase() === config.jellyfinUserId.toLowerCase()
        );

        return userSessions;
    } catch (error) {
        console.error('Error fetching user sessions:', error.message);
        return [];
    }
}

async function getJellyfinUsers() {
    const endpoints = ['/Users', '/emby/Users', 'Users'];

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

async function getItemDetails(itemId) {
    const endpoints = [`/Items/${itemId}`, `/emby/Items/${itemId}`, `Items/${itemId}`];

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
                const response = await axios.get(url, {
                    headers,
                    params: {
                        userId: config.jellyfinUserId
                    }
                });
                return response.data;
            } catch (error) {
            }
        }
    }

    return null;
}

function getJellyfinImageUrl(itemId, imageType = 'Primary') {
    const baseUrl = config.jellyfinServerUrl.replace(/\/$/, '');

    const imageUrl = `${baseUrl}/Items/${itemId}/Images/${imageType}`;
    return `${imageUrl}?api_key=${config.jellyfinApiKey}&maxWidth=1024`;
}

module.exports = {
    getJellyfinSessions,
    getJellyfinUserSessions,
    getJellyfinUsers,
    getItemDetails,
    getJellyfinImageUrl
};
