const { isMobileDevice } = require('../utils/device');
const { formatPlayerBar } = require('../utils/formatting');
const { getPlaybackIconUrl } = require('../utils/discord');
const { getJellyfinImageUrl } = require('./jellyfin');
const dotenv = require('dotenv');
dotenv.config();
const lastfmUsername = process.env.LASTFM_USERNAME || 'your_lastfm_user_here';

function buildActivity(session) {
    const item = session.NowPlayingItem;
    const playState = session.PlayState;

    let title = item.Name || 'Unknown';
    let details = '';
    let state = '';
    let largeImageKey = 'jellyfin';
    let largeImageUrl = null;
    let smallImageKey = null;
    let smallImageText = '';

    if (item.Type === 'Movie') {
        details = title;
        if (item.ProductionYear) {
            state = `${item.ProductionYear}`;
        }
        largeImageKey = 'jellyfin_movie';
        if (item.Id) {
            largeImageUrl = getJellyfinImageUrl(item.Id, 'Primary');
        }
    } else if (item.Type === 'Episode') {
        const seriesName = item.SeriesName || 'Unknown Series';
        const episodeTitle = title;
        const seasonEpisode = item.IndexNumber ? `S${String(item.ParentIndexNumber || 0).padStart(2, '0')}E${String(item.IndexNumber).padStart(2, '0')}` : '';

        details = seriesName;
        if (episodeTitle && episodeTitle !== seriesName) {
            details += ` │ ${episodeTitle}`;
        }
        if (seasonEpisode) {
            details += ` │ ${seasonEpisode}`;
        }
        state = '';
        largeImageKey = 'jellyfin_episode';
        if (item.SeriesId) {
            largeImageUrl = getJellyfinImageUrl(item.SeriesId, 'Primary');
        } else if (item.Id) {
            largeImageUrl = getJellyfinImageUrl(item.Id, 'Primary');
        }
    } else if (item.Type === 'Audio') {
        const artistName = item.Artists && item.Artists.length > 0 ? item.Artists[0] : 'Unknown Artist';
        details = `🎵 Playing song: ${title}`;
        state = `by ${artistName}`;
        largeImageKey = 'jellyfin_music';
        if (item.Id) {
            largeImageUrl = getJellyfinImageUrl(item.Id, 'Primary');
        }
    } else {
        details = title;
        state = item.Type || 'Media';
        if (item.Id) {
            largeImageUrl = getJellyfinImageUrl(item.Id, 'Primary');
        }
    }

    const isPaused = playState.IsPaused === true;
    const isMobile = isMobileDevice(session);
    const playbackIconUrl = getPlaybackIconUrl(isPaused);

    
    let playbackStatus = 'Playing';
    if (isPaused) {
        playbackStatus = 'Paused';
    } else if (item.Type === 'Audio') {
        playbackStatus = 'Playing Song';
    } else if (item.Type === 'Movie') {
        playbackStatus = 'Watching Movie';
    } else if (item.Type === 'Episode') {
        playbackStatus = 'Watching TV';
    }

    smallImageKey = playbackIconUrl;
    smallImageText = playbackStatus;

    let startTimestamp = null;
    let endTimestamp = null;
    let currentTimeSeconds = null;
    let totalTimeSeconds = null;

    if (playState.PositionTicks && item.RunTimeTicks) {
        currentTimeSeconds = Math.floor(playState.PositionTicks / 10000000);
        totalTimeSeconds = Math.floor(item.RunTimeTicks / 10000000);

        if (!isPaused) {
            const remainingTimeSeconds = totalTimeSeconds - currentTimeSeconds;
            startTimestamp = Date.now() - (currentTimeSeconds * 1000);
            endTimestamp = Date.now() + (remainingTimeSeconds * 1000);
        }
    }

    let playerBarText = '';
    if (currentTimeSeconds && totalTimeSeconds && item.Type !== 'Audio') {
        playerBarText = formatPlayerBar(
            currentTimeSeconds,
            totalTimeSeconds,
            isPaused,
            isMobile,
            true  
        );
    } else if (isMobile && item.Type !== 'Audio') {
        playerBarText = '📱 Mobile';
    }

    if (playerBarText) {
        if (item.Type === 'Episode') {
            state = playerBarText;
        } else {
            if (state) {
                state = `${state} │ ${playerBarText}`;
            } else {
                state = playerBarText;
            }
        }
    }

    const activity = {
        details: details,
        state: state,
        largeImageKey: largeImageKey,
        largeImageText: details,
        startTimestamp: startTimestamp,
        endTimestamp: endTimestamp,
        instance: false,
        largeImageUrl: largeImageUrl
    };

    
    if (item.Type === 'Audio') {
        const artistName = item.Artists && item.Artists.length > 0 ? item.Artists[0] : '';
        if (artistName && title) {
            const cleanArtist = artistName.trim().replace(/\s+/g, '+');
            const cleanTitle = title.trim().replace(/\s+/g, '+');
            const lastFmUrl = `https://www.last.fm/music/${cleanArtist}/_/${cleanTitle}`;

            activity.buttons = [
                {
                    label: 'View on Last.fm',
                    url: lastFmUrl
                },
                {
                    label: 'View Listening History',
                    url: `https://www.last.fm/user/${lastfmUsername}`
                }
            ];
        }
    }

    if (smallImageKey) {
        activity.smallImageKey = smallImageKey;
        activity.smallImageText = smallImageText;
    }

    return { activity, session, isMobile, largeImageUrl };
}

module.exports = {
    buildActivity
};
