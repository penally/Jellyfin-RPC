const RPC = require('discord-rpc');
const { Client: SelfbotClient } = require('discord.js-selfbot-v13');
const config = require('../config/config');
const { isDiscordRunning } = require('../utils/discord');

let rpc = null;
let selfbotClient = null;

class DiscordClient {
    constructor() {
        this.rpc = null;
        this.selfbotClient = null;
    }

    async setActivity(activity) {
        if (config.useSelfbot && this.selfbotClient) {
            const selfbotActivity = {
                name: 'Jellyfin',
                type: 0, // PLAYING
                details: activity.details,
                state: activity.state
            };

            if (activity.startTimestamp) {
                selfbotActivity.startTimestamp = Math.floor(activity.startTimestamp / 1000);
            }
            if (activity.endTimestamp) {
                selfbotActivity.endTimestamp = Math.floor(activity.endTimestamp / 1000);
            }

            // Note: Discord Rich Presence for selfbots requires registered asset keys in Discord Developer Portal.
            // Since arbitrary image URLs are not supported, we'll skip images to avoid question marks.
            // To enable images:
            // 1. Go to https://discord.com/developers/applications
            // 2. Select your application (or create one)
            // 3. Go to "Rich Presence" → "Art Assets"
            // 4. Upload images and note their asset keys (e.g., "jellyfin", "jellyfin_movie", etc.)
            // 5. Update the code to use those registered keys instead of URLs

            // For now, we'll skip images entirely to prevent question marks
            // Uncomment below and use registered asset keys if you've set them up:
            /*
            const assets = {};
            if (activity.largeImageKey && !activity.largeImageKey.startsWith('http')) {
                assets.large_image = activity.largeImageKey; // Must be a registered asset key
                if (activity.largeImageText) {
                    assets.large_text = activity.largeImageText;
                }
            }
            if (Object.keys(assets).length > 0) {
                selfbotActivity.assets = assets;
            }
            */

            this.selfbotClient.user.setActivity(selfbotActivity);
        } else if (this.rpc) {
            const ipcActivity = {
                ...activity,
                largeImageKey: activity.largeImageUrl || activity.largeImageKey
            };
            await this.rpc.setActivity(ipcActivity);
        }
    }

    async clearActivity() {
        if (config.useSelfbot && this.selfbotClient) {
            this.selfbotClient.user.setActivity(null);
        } else if (this.rpc) {
            await this.rpc.clearActivity();
        }
    }

    async initializeRPC() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Connecting to Discord via IPC...');
            console.log(`📋 Using Client ID: ${config.discordClientId}`);

            this.rpc = new RPC.Client({ transport: 'ipc' });

            this.rpc.on('ready', () => {
                console.log('✅ Connected to Discord!');
                console.log(`👤 Logged in as: ${this.rpc.user.username}#${this.rpc.user.discriminator}`);
                resolve();
            });

            this.rpc.on('error', (error) => {
                console.error('Discord RPC Error:', error);
                reject(error);
            });

            const discordRunning = isDiscordRunning();
            if (discordRunning === false) {
                const error = new Error('Discord does not appear to be running!');
                console.error('\n❌ ERROR:', error.message);
                console.error('💡 Please start Discord Desktop app and try again.');
                console.error('💡 Make sure you are using Discord Desktop (not Discord web or mobile app)');
                console.error('💡 Alternatively, enable USE_SELFBOT=true in .env to use selfbot mode');
                reject(error);
                return;
            } else if (discordRunning === null) {
                console.log('⚠️  Could not verify if Discord is running, attempting connection anyway...');
            } else {
                console.log('✅ Discord process detected');
            }

            this.rpc.login({ clientId: config.discordClientId }).catch(err => {
                console.error('\n❌ Failed to connect to Discord:', err.message || err);
                console.error('\n🔍 Troubleshooting steps:');
                console.error('   1. Make sure Discord Desktop app is running (not web browser)');
                console.error('   2. Verify your DISCORD_CLIENT_ID is correct:');
                console.error(`      Current value: ${config.discordClientId}`);
                console.error('   3. Get your Client ID from: https://discord.com/developers/applications');
                console.error('      - Create a new application or select an existing one');
                console.error('      - Copy the "Application ID" (not Client Secret)');
                console.error('   4. Make sure Rich Presence is enabled in Discord:');
                console.error('      Settings → Activity Privacy → Display currently running game');
                console.error('   5. Try restarting Discord Desktop app');
                console.error('   6. Make sure you are logged into Discord Desktop');
                console.error('   7. Alternatively, enable USE_SELFBOT=true in .env to use selfbot mode');

                if (err.message && err.message.includes('TIMEOUT')) {
                    console.error('\n⏱️  Connection timeout usually means:');
                    console.error('   - Discord is not running');
                    console.error('   - Discord is starting up (wait a few seconds and try again)');
                    console.error('   - Discord IPC pipe is blocked');
                }

                reject(err);
            });
        });
    }

    async initializeSelfbot() {
        return new Promise((resolve, reject) => {
            console.log('🤖 Initializing Discord selfbot...');
            if (config.selfbotToken) {
                console.log(`📋 Using selfbot token: ${config.selfbotToken.substring(0, 20)}...`);
            }

            this.selfbotClient = new SelfbotClient({
                checkUpdate: false
            });

            this.selfbotClient.on('ready', () => {
                console.log('✅ Connected to Discord via selfbot!');
                console.log(`👤 Logged in as: ${this.selfbotClient.user.tag}`);
                resolve();
            });

            this.selfbotClient.on('error', (error) => {
                console.error('Discord Selfbot Error:', error);
                reject(error);
            });

            this.selfbotClient.login(config.selfbotToken).catch(err => {
                console.error('\n❌ Failed to connect to Discord selfbot:', err.message || err);
                console.error('\n🔍 Troubleshooting steps:');
                console.error('   1. Verify your SELFBOT_TOKEN is correct');
                console.error('   2. Make sure the token is valid and not expired');
                console.error('   3. Note: Selfbots violate Discord ToS - use at your own risk');
                reject(err);
            });
        });
    }

    async connect() {
        if (config.useSelfbot) {
            await this.initializeSelfbot();
        } else {
            await this.initializeRPC();
        }
    }

    disconnect() {
        if (this.rpc) {
            this.rpc.destroy();
            this.rpc = null;
        }
        if (this.selfbotClient) {
            this.selfbotClient.destroy();
            this.selfbotClient = null;
        }
    }
}

module.exports = DiscordClient;
