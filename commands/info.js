const os = require('os'); // To get system information
const { MessageEmbed } = require('discord.js'); // For fancy embeds

module.exports = {
    name: 'info',
    description: 'Displays information about the bot',
    execute(message, args) {
        // Uptime in a human-readable format
        const uptime = formatUptime(process.uptime());

        // Bot's creator (as per your config.js or manually)
        const botCreator = 'hirako'; // You can replace this with your creator info

        // CPU and RAM Usage
        const cpuUsage = os.loadavg()[0].toFixed(2); // 1-minute load average
        const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2); // RSS (Resident Set Size)

        // Hosting Location (custom message for Japan)
        const hostingLocation = "Japan";

        // Embed to show info
        const embed = new MessageEmbed()
            .setColor('#1db954') // Embed color
            .setTitle('Bot Information')
            .addFields(
                { name: 'Bot Uptime', value: uptime, inline: true },
                { name: 'Creator', value: botCreator, inline: true },
                { name: 'CPU Usage (1min avg)', value: `${cpuUsage}%`, inline: true },
                { name: 'RAM Usage (RSS)', value: `${memoryUsage} MB`, inline: true },
                { name: 'Hosting Location', value: hostingLocation, inline: true }
            )
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        // Send the embed to the channel
        message.channel.send({ embeds: [embed] });
    },
};

// Helper function to format uptime in a readable format
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = Math.floor(seconds % 60);

    let uptime = '';
    if (days > 0) uptime += `${days}d `;
    if (hours > 0) uptime += `${hours}h `;
    if (minutes > 0) uptime += `${minutes}m `;
    uptime += `${secondsLeft}s`;

    return uptime;
}
