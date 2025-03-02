const { EmbedBuilder } = require('discord.js');
const { playlistCollection } = require('../mongodb.js');
const musicIcons = require('../UI/icons/musicicons.js');
const config = require('../config.js');

async function addSong(client, message, args, lang) {
    try {
        const playlistName = args[0];
        const songInput = args.slice(1).join(' '); // Get the song input
        const userId = message.author.id;

        // Check if the playlist exists in the database
        const playlist = await playlistCollection.findOne({ name: playlistName });
        if (!playlist) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: lang.addsong.embed.playlistNotFound, 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription(lang.addsong.embed.playlistNotFoundDescription)
                .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
            return;
        }

        if (playlist.userId !== userId) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: lang.addsong.embed.accessDenied, 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription(lang.addsong.embed.accessDeniedDescription)
                .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
            return;
        }

        const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/gm;
        let song;

        if (urlPattern.test(songInput)) {
            song = { url: songInput };
        } else {
            song = { name: songInput };
        }

        // Update the playlist in the database with the new song
        await playlistCollection.updateOne(
            { name: playlistName },
            { $push: { songs: song } }
        );

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({ 
                name: lang.addsong.embed.songAdded, 
                iconURL: musicIcons.correctIcon,
                url: config.SupportServer
            })
            .setDescription(lang.addsong.embed.songAddedDescription.replace("{songInput}", songInput).replace("{playlistName}", playlistName))
            .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error adding song:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: lang.addsong.embed.error, 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setDescription(lang.addsong.embed.errorDescription)
            .setFooter({ text: 'Made by Hirako!', iconURL: musicIcons.heartIcon })
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

module.exports = {
    name: 'addsong',
    description: 'Add a song to a playlist',
    permissions: '0x0000000000000800',
    run: addSong
};
