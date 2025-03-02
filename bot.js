const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config.js");
const fs = require("fs");
const path = require('path');
const { initializePlayer } = require('./player');
const { connectToDatabase } = require('./mongodb');
const colors = require('./UI/colors/colors');
require('dotenv').config();

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a];
    }),
});

client.config = config;
initializePlayer(client);

client.on("ready", () => {
    console.log(`${colors.cyan}[ SYSTEM ]${colors.reset} ${colors.green}Client logged as ${colors.yellow}${client.user.tag}${colors.reset}`);
    console.log(`${colors.cyan}[ MUSIC ]${colors.reset} ${colors.green}Riffy Music System Ready 🎵${colors.reset}`);
    console.log(`${colors.cyan}[ TIME ]${colors.reset} ${colors.gray}${new Date().toISOString().replace('T', ' ').split('.')[0]}${colors.reset}`);
    client.riffy.init(client.user.id);
});

client.config = config;

// Read events
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

// Message handling for prefix commands
client.on('messageCreate', (message) => {
    // Check if the message is from a bot
    if (message.author.bot) return;

    // Define your prefix
    const prefix = config.prefix || '-';  // You can set the default prefix in config.js

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
            commandFile.execute(message, args);
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

// Express server
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
