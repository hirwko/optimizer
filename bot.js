// Handle message commands
client.on('messageCreate', (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Get the prefix from config
    const prefix = config.prefix || '$';  // Now using '$' as the prefix

    // Check if the message starts with the prefix
    if (!message.content.startsWith(prefix)) return;

    // Parse the command and arguments
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Check if the command exists in the commands map
    const command = client.commands.get(commandName);

    if (command) {
        // If the command exists, execute it
        try {
            command.execute(message, args, client);
        } catch (err) {
            console.error(err);
            message.reply('There was an error trying to execute that command!');
        }
    } else {
        message.reply(`Unknown command: ${commandName}`);
    }
});
