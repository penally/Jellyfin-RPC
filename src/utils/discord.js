const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function isDiscordRunning() {
    try {
        if (process.platform === 'win32') {
            const result = execSync('tasklist /FI "IMAGENAME eq Discord.exe" /FO CSV /NH', {
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore']
            });
            return result.trim().length > 0 && result.includes('Discord.exe');
        } else {
            try {
                execSync('pgrep -f Discord', { stdio: 'ignore' });
                return true;
            } catch {
                return false;
            }
        }
    } catch (error) {
        // assume its running maybe
        return null;
    }
}

function checkDiscordIPC() {
    if (process.platform === 'win32') {
        const appData = process.env.APPDATA || process.env.LOCALAPPDATA;
        const discordPaths = [
            path.join(appData, 'discord', 'Local Storage', 'leveldb'),
            path.join(process.env.LOCALAPPDATA || '', 'Discord', 'Local Storage', 'leveldb')
        ];

        for (const discordPath of discordPaths) {
            if (fs.existsSync(path.dirname(discordPath))) {
                return true;
            }
        }
    }
    return null;
}

function getPlaybackIconUrl(isPaused) {
    if (isPaused) {
        return 'https://cdn.sillydev.co.uk/u/TIm2kTVAzC8XWNM.png';
    } else {
        return 'https://cdn.sillydev.co.uk/u/2L9gCJFIAcl4c2L.png';
    }
}

module.exports = {
    isDiscordRunning,
    checkDiscordIPC,
    getPlaybackIconUrl
};
