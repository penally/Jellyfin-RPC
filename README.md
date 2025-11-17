# Jellyfin Mobile RPC

A Discord Rich Presence application that displays your Jellyfin playback status, with special indicators when watching on mobile devices.

## Features

- 🎬 Shows what you're watching on Jellyfin in Discord
- 📱 Detects and displays when watching on mobile devices
- 🔄 Automatically updates playback status
- ⏱️ Shows progress bar for movies/episodes
- 🎵 Supports Movies, TV Shows, and Music

## Prerequisites

- Node.js (v14 or higher)
- Discord Desktop App (must be running)
- A Jellyfin server with API access
- A Discord Application (for Client ID)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Jellyfin RPC")
4. Go to the "General Information" tab
5. Copy the **Application ID** (this is your Client ID)
6. Go to "Rich Presence" tab and upload images (optional):
   - `jellyfin` (512x512) - Main logo
   - `jellyfin_movie` (512x512) - Movie icon
   - `jellyfin_episode` (512x512) - TV show icon
   - `jellyfin_music` (512x512) - Music icon
   - `mobile` (512x512) - Mobile device indicator

### 3. Get Jellyfin API Key

#### Method 1: Using Jellyfin Web Interface

1. Log into your Jellyfin server
2. Go to Dashboard → API Keys
3. Click "New API Key"
4. Name it "Discord RPC" or similar
5. Copy the generated API key

#### Method 2: Using API Request

```bash
curl -X POST "http://YOUR_SERVER:8096/Users/authenticatebyname" \
  -H "Content-Type: application/json" \
  -d '{
    "Username": "YOUR_USERNAME",
    "Pw": "YOUR_PASSWORD"
  }'
```

The response will contain an `AccessToken` - this is your API key.

### 4. Get Jellyfin User ID

```bash
curl -X GET "http://YOUR_SERVER:8096/Users" \
  -H "X-Emby-Token: YOUR_API_KEY"
```

Find your username in the response and copy the `Id` field.

### 5. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Discord Application Settings
DISCORD_CLIENT_ID=your_discord_client_id_here

# Selfbot Settings (Optional - Discord Desktop does not need to be running)
# WARNING: Selfbots violate Discord's Terms of Service - use at your own risk
USE_SELFBOT=false
SELFBOT_TOKEN=your_discord_user_token_here

# Jellyfin Server Settings
JELLYFIN_SERVER_URL=http://localhost:8096
JELLYFIN_USER_ID=your_jellyfin_user_id_here
JELLYFIN_API_KEY=your_jellyfin_api_key_here

# Update interval in milliseconds (default: 5000 = 5 seconds)
UPDATE_INTERVAL=5000

# Last.fm integration (Optional)
LASTFM_USERNAME=your_lastfm_user_here
```

**Important:** Replace all placeholder values with your actual credentials!

## Usage

### Start the Application

```bash
npm start
```

Or use the executable directly:

```bash
./bin/jellyfin-rpc.js
```

The application will:
- Connect to Discord
- Start monitoring your Jellyfin sessions
- Update your Discord status automatically

### Get User ID Helper

If you need help finding your Jellyfin User ID:

```bash
npm run get-user-id
```

Or:

```bash
./bin/get-user-id.js
```

### Running in Background

#### Windows (PowerShell)

```powershell
Start-Process node -ArgumentList "bin/jellyfin-rpc.js" -WindowStyle Hidden
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start bin/jellyfin-rpc.js --name jellyfin-rpc
pm2 save
pm2 startup
```

#### Linux/Mac

```bash
nohup node bin/jellyfin-rpc.js > jellyfin-rpc.log 2>&1 &
```

Or with PM2:

```bash
npm install -g pm2
pm2 start bin/jellyfin-rpc.js --name jellyfin-rpc
pm2 save
pm2 startup
```

## Jellyfin API Usage

This application uses the following Jellyfin API endpoints:

### 1. Get User Sessions
```
GET /Users/{UserId}/Sessions
Headers:
  X-Emby-Token: {API_KEY}
```

Returns all active sessions for the specified user.

### 2. Get Item Details
```
GET /Items/{ItemId}?userId={UserId}
Headers:
  X-Emby-Token: {API_KEY}
```

Returns detailed information about a media item (movie, episode, song, etc.).

### 3. Authentication Header Format
```
X-Emby-Authorization: MediaBrowser Client="Jellyfin Mobile RPC", Device="PC", DeviceId="rpc-client", Version="1.0.0", Token="{API_KEY}"
```

## Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DISCORD_CLIENT_ID` | Your Discord Application ID | Yes | - |
| `USE_SELFBOT` | Use Discord selfbot instead of official RPC | No | `false` |
| `SELFBOT_TOKEN` | Discord user token for selfbot mode | No | - |
| `JELLYFIN_SERVER_URL` | Your Jellyfin server URL | Yes | `http://localhost:8096` |
| `JELLYFIN_USER_ID` | Your Jellyfin user UUID | Yes | - |
| `JELLYFIN_API_KEY` | Your Jellyfin API key | Yes | - |
| `UPDATE_INTERVAL` | How often to check for updates (ms) | No | `5000` |
| `LASTFM_USERNAME` | Your Last.fm username for scrobbling integration | No | - |
|

## Troubleshooting

### Discord Not Connecting
- Make sure Discord Desktop app is running
- Verify `DISCORD_CLIENT_ID` is correct
- Check that Discord is not in "Do Not Disturb" mode

### Jellyfin API Errors
- Verify `JELLYFIN_SERVER_URL` is correct (include `http://` or `https://`)
- Check that `JELLYFIN_API_KEY` is valid
- Ensure `JELLYFIN_USER_ID` is the correct UUID
- Make sure your Jellyfin server is accessible from your PC

### No Status Showing
- Make sure you have an active playback session in Jellyfin
- Check that the session is for the correct user
- Verify the update interval isn't too long

### Mobile Detection Not Working
- Mobile devices are detected by device name containing: "mobile", "android", "ios", "iphone", "ipad"
- Check your Jellyfin client's device name in the sessions API

## API Reference

### Jellyfin Session Object Structure

```json
{
  "Id": "session-id",
  "UserId": "user-uuid",
  "UserName": "username",
  "Client": "Jellyfin Mobile",
  "DeviceName": "iPhone",
  "NowPlayingItem": {
    "Id": "item-id",
    "Name": "Movie Title",
    "Type": "Movie",
    "ProductionYear": 2023,
    "RunTimeTicks": 72000000000
  },
  "PlayState": {
    "PositionTicks": 36000000000,
    "IsPaused": false
  }
}
```

## License

MIT




