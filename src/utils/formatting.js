function formatTime(seconds) {
    if (!seconds || seconds < 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }
}

function formatRemainingTime(seconds) {
    if (!seconds || seconds < 0) return '0m left';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m left`;
    } else if (hours > 0) {
        return `${hours}h left`;
    } else {
        return `${minutes}m left`;
    }
}

function createProgressBar(current, total, barLength = 10) {
    if (!current || !total || total === 0) return '';

    const progress = Math.min(current / total, 1);
    const filled = Math.round(progress * barLength);
    const empty = barLength - filled;
    const filledChar = '▰';
    const emptyChar = '▱';
    return filledChar.repeat(filled) + emptyChar.repeat(empty);
}

function formatPercentage(current, total) {
    if (!current || !total || total === 0) return '0%';
    const percent = Math.round((current / total) * 100);
    return `${percent}%`;
}

function formatPlayerBar(currentSeconds, totalSeconds, isPaused, isMobile, includeProgressBar = true) {
    if (!currentSeconds || !totalSeconds) return '';

    const currentTime = formatTime(currentSeconds);
    const totalTime = formatTime(totalSeconds);
    const progress = includeProgressBar ? createProgressBar(currentSeconds, totalSeconds, 12) : '';
    const percentage = formatPercentage(currentSeconds, totalSeconds);

    const deviceIcon = isMobile ? '📱' : '🖥️';

    let playerBar = '';
    playerBar += `${currentTime} / ${totalTime}`;

    if (progress) {
        playerBar += ` ${progress}`;
    }

    if (includeProgressBar) {
        playerBar += ` ${percentage}`;
    }

    if (isMobile) {
        playerBar += ` │ ${deviceIcon} Mobile`;
    }

    if (playerBar.length > 128) {
        if (isMobile && playerBar.includes(` │ ${deviceIcon} Mobile`)) {
            const withoutMobile = playerBar.replace(` │ ${deviceIcon} Mobile`, '');
            if (withoutMobile.length <= 128) {
                playerBar = withoutMobile;
            }
        }

        if (playerBar.length > 128 && progress) {
            const shorterProgress = createProgressBar(currentSeconds, totalSeconds, 8);
            playerBar = playerBar.replace(progress, shorterProgress);

            if (playerBar.length > 128) {
                const evenShorterProgress = createProgressBar(currentSeconds, totalSeconds, 6);
                playerBar = playerBar.replace(shorterProgress, evenShorterProgress);
            }
        }

        if (playerBar.length > 128 && isMobile && playerBar.includes(` │ ${deviceIcon} Mobile`)) {
            playerBar = playerBar.replace(` │ ${deviceIcon} Mobile`, '');
        }

        if (playerBar.length > 128) {
            playerBar = playerBar.substring(0, 125) + '...';
        }
    }

    return playerBar;
}

module.exports = {
    formatTime,
    formatRemainingTime,
    createProgressBar,
    formatPercentage,
    formatPlayerBar
};
