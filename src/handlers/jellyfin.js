// Jellyfin API handler - provides high-level interface to Jellyfin API
const jellyfinClient = require('../jellyfin/client');

module.exports = {
    getJellyfinSessions: jellyfinClient.getJellyfinSessions,
    getJellyfinUserSessions: jellyfinClient.getJellyfinUserSessions,
    getJellyfinUsers: jellyfinClient.getJellyfinUsers,
    getItemDetails: jellyfinClient.getItemDetails,
    getJellyfinImageUrl: jellyfinClient.getJellyfinImageUrl
};
