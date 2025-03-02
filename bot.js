const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config.js");
const fs = require("fs");
const path = require('path');
const { initializePlayer } = require('./player');
const { connectToDatabase } = require('./mongodb');
const colors = require('./UI/colors/colors');
const DisTube = require('distube');  // Importing DisTube
require('dotenv').config();

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a];
    }),
});

client.config = config;
initializePlayer(client);

// Create a DisTube instance to manage music playback (remove searchSongs)
client.distube = new DisTube.DisTube(client, { 
    emitNewSongOnly: true,  // Only emit when a new song starts playing
});

// Log when the bot is ready
client.on("ready", () => {
    console.log(`${colors.cyan}[ SYSTEM ]${colors.reset} ${colors.green}Client logged as ${colors.yellow}${client.user.tag}${colors.reset}`);
    console.log(`${colors.cyan}[ MUSIC ]${colors.reset} ${colors.green}Riffy Music System Ready 🎵${colors.reset}`);
    console.log(`${colors.cyan}[ TIME ]${colors.reset} ${colors.gray}${new Date().toISOString().replace('T', ' ').split('.')[0]}${colors.reset}`);
    client.riffy.init(client.user.id);
});

// Read events and commands
fs.readdir("./events", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0]; 
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
});

// Read commands
client.commands = [];
fs.readdir(config.commandsDir, (err, files) => {
    if (err) throw err;
    files.forEach(async (f) => {
        try {
            if (f.endsWith(".js")) {
                let props = require(`${config.commandsDir}/${f}`);
                client.commands.push({
                    name: props.name,
                    description: props.description,
                    options: props.options,
                });
            }
        } catch (err) {
            console.log(err);
        }
    });
});

// Handle message commands
client.on('messageCreate', (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Get the prefix from config
    const prefix = config.prefix || '-';  // Fallback to '-' if no prefix is specified in config

    // Check if the message starts with the prefix
    if (!message.content.startsWith(prefix)) return;

    // Parse the command and arguments
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Check if the command exists in the commands array
    const command = client.commands.find(cmd => cmd.name === commandName);

    if (command) {
        // If the command exists, execute it
        try {
            const commandFile = require(`${config.commandsDir}/${command.name}.js`);
            commandFile.execute(message, args, client);
        } catch (err) {
            console.error(err);
            message.reply('There was an error trying to execute that command!');
        }
    }
});

// Handle raw Discord events (voice state updates, etc.)
client.on("raw", (d) => {
    const { GatewayDispatchEvents } = require("discord.js");
    if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return;
    client.riffy.updateVoiceState(d);
});

// Add loop functionality for music
client.distube.on('finish', (queue) => {
    if (queue.looping) {
        // Re-queue the current song if looping is enabled
        queue.play(queue.songs[0].url);
    }
});

// Loop command for toggling looping behavior
client.commands.push({
    name: 'loop',
    description: 'Toggles looping for the current song.',
    async execute(message, args) {
        const queue = client.distube.getQueue(message);
        if (!queue) {
            return message.reply("There is no song currently playing.");
        }

        if (args[0] === 'on') {
            if (queue.looping) {
                return message.reply("The song is already looping.");
            }
            queue.looping = true;
            message.channel.send("The current song will now loop indefinitely.");
        } else if (args[0] === 'off') {
            if (!queue.looping) {
                return message.reply("The song is not looping.");
            }
            queue.looping = false;
            message.channel.send("The loop has been disabled. The next song will play.");
        } else {
            message.reply("Please specify either `-loop on` or `-loop off`.");
        }
    },
});

// Login to the bot
client.login(config.TOKEN || process.env.TOKEN).catch((e) => {
    console.log('\n' + '─'.repeat(40));
    console.log(`${colors.magenta}${colors.bright}🔐 TOKEN VERIFICATION${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.cyan}[ TOKEN ]${colors.reset} ${colors.red}Authentication Failed ❌${colors.reset}`);
    console.log(`${colors.gray}Error: Turn On Intents or Reset New Token${colors.reset}`);
});

// Connect to the database
connectToDatabase().then(() => {
    console.log('\n' + '─'.repeat(40));
    console.log(`${colors.magenta}${colors.bright}🕸️  DATABASE STATUS${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.cyan}[ DATABASE ]${colors.reset} ${colors.green}MongoDB Online ✅${colors.reset}`);
}).catch((err) => {
    console.log('\n' + '─'.repeat(40));
    console.log(`${colors.magenta}${colors.bright}🕸️  DATABASE STATUS${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.cyan}[ DATABASE ]${colors.reset} ${colors.red}Connection Failed ❌${colors.reset}`);
    console.log(`${colors.gray}Error: ${err.message}${colors.reset}`);
});

// Express server (if required)
const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});

app.listen(port, () => {
    console.log('\n' + '─'.repeat(40));
    console.log(`${colors.magenta}${colors.bright}🌐 SERVER STATUS${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.cyan}[ SERVER ]${colors.reset} ${colors.green}Online ✅${colors.reset}`);
    console.log(`${colors.cyan}[ PORT ]${colors.reset} ${colors.yellow}http://localhost:${port}${colors.reset}`);
    console.log(`${colors.cyan}[ TIME ]${colors.reset} ${colors.gray}${new Date().toISOString().replace('T', ' ').split('.')[0]}${colors.reset}`);
    console.log(`${colors.cyan}[ USER ]${colors.reset} ${colors.yellow}HIRAKO!${colors.reset}`);
});
