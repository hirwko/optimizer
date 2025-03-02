const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

module.exports = {
  name: "help",
  description: "Get information about the bot",
  permissions: "SEND_MESSAGES", // Update the permission to the string name, not hex code
  options: [],
  run: async (client, interaction, lang) => {
    try {
      const botName = client.user.username;

      // Path to the commands folder
      const commandsPath = path.join(__dirname, "../commands");
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      const totalCommands = commandFiles.length;

      // Gather server and user count information
      const totalServers = client.guilds.cache.size;
      const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

      // Calculate bot uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // Get the bot's ping
      const ping = client.ws.ping;

      // Build the embed message
      const embed = new EmbedBuilder()
        .setColor(config.embedColor || "#7289DA")
        .setTitle(lang.help.embed.title.replace("{botName}", botName))
        .setAuthor({
          name: lang.help.embed.author,
          iconURL: musicIcons.alertIcon,
          url: config.SupportServer
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setDescription(lang.help.embed.description
          .replace("{botName}", botName)
          .replace("{totalCommands}", totalCommands)
          .replace("{totalServers}", totalServers)
          .replace("{totalUsers}", totalUsers)
          .replace("{uptimeString}", uptimeString)
          .replace("{ping}", ping)
        )
        .addFields(
          {
            name: lang.help.embed.availableCommands,
            value: commandFiles.length > 0
              ? commandFiles.map(file => {
                  const command = require(path.join(commandsPath, file));
                  return `\`/${command.name}\` - ${command.description || lang.help.embed.noDescription}`;
                }).join('\n')
              : lang.help.embed.noCommands
          }
        )
        .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon })
        .setTimestamp();

      // Reply to the interaction with the embed
      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      return interaction.reply({
        content: `${lang.help.embed.error}\n\`\`\`${e.message}\`\`\``,
        ephemeral: true,
      });
    }
  },
};
