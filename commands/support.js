const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

module.exports = {
    name: "support",
    description: "Get support server link",
    permissions: "0x0000000000000800",
    options: [],
    run: async (client, interaction, lang) => {
        try {
            // Acknowledge the interaction to prevent timeout
            await interaction.deferReply();

            // Links to replace the placeholders with
            const supportServerLink = "https://discord.gg/cuddlez";
            const instagramLink = "https://instagram.com/@yuknzxl";  // Instagram link
            const facebookLink = "https://www.facebook.com/hirakoisdead";  // Facebook link
            const soundcloudLink = "https://soundcloud.com/tatsumihirako/sets/kowai";  // Soundcloud link

            // Embed creation
            const embed = new EmbedBuilder()
                .setColor('#b300ff')
                .setAuthor({
                    name: lang.support.embed.authorName,
                    iconURL: musicIcons.beats2Icon, 
                    url: config.SupportServer
                })
                .setDescription(lang.support.embed.description
                    .replace("{supportServerLink}", supportServerLink)  // Discord support server
                    .replace("{instagramLink}", instagramLink)  // Instagram link
                    .replace("{facebookLink}", facebookLink)  // Facebook link
                    .replace("{soundcloudLink}", soundcloudLink)  // Soundcloud link
                )
                .setImage('https://cdn.discordapp.com/attachments/1300383206712934513/1314821125754195978/a_1c5c4f341e4f508b06f97b0f04b7cf9a.gif?ex=67c53998&is=67c3e818&hm=a2f276f56c027763f98ddfe27fd7068d899f71dd073db6788f85196d95f33339&')
                .setTimestamp();

            // Send the embed reply
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: lang.support.embed.error,
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription(lang.support.embed.errorDescription)
                .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon });

            // Send the error embed reply
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
