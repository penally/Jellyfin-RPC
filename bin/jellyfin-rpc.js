#!/usr/bin/env node

const { startDiscordConnection, cleanup } = require('../src/handlers/discord');


process.on('SIGINT', () => {
    console.log('\n Shutting down...');
    cleanup();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n Shutting down...');
    cleanup();
    process.exit(0);
});


startDiscordConnection();
