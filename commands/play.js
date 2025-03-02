const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const musicIcons = require('../UI/icons/musicicons.js');

async function play(client, message, args) {
    try {
        const query = args.join(" "); // Get the song name or URL from args

        if (!message.member.voice.channelId) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: 'Error', 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: 'Footer', iconURL: musicIcons.heartIcon })
                .setDescription('You need to join a voice channel first!');

            await message.reply({ embeds: [embed] });
            return;
        }

        if (!client.riffy.nodes || client.riffy.nodes.size === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: 'Error',
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: 'Footer', iconURL: musicIcons.heartIcon })
                .setDescription('No Lavalink nodes available.');

            await message.reply({ embeds: [embed] });
            return;
        }

        const player = client.riffy.createConnection({
            guildId: message.guildId,
            voiceChannel: message.member.voice.channelId,
            textChannel: message.channelId,
            deaf: true
        });

        const resolve = await client.riffy.resolve({ query: query, requester: message.author.username });
        if (!resolve || typeof resolve !== 'object') {
            throw new TypeError('Resolve response is not an object');
        }

        const { loadType, tracks } = resolve;

        if (!Array.isArray(tracks)) {
            throw new TypeError('Expected tracks to be an array');
        }

        if (loadType === 'track' || loadType === 'search') {
            const track = tracks.shift();
            track.info.requester = message.author.username;

            player.queue.add(track);

            if (!player.playing && !player.paused) player.play();

            const successEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({
                    name: 'Track Added',
                    iconURL: musicIcons.beats2Icon,
                    url: config.SupportServer
                })
                .setDescription(`Now playing: [${track.info.title}](https://www.youtube.com/watch?v=${track.info.uri})`)
                .setFooter({ text: 'Footer', iconURL: musicIcons.heartIcon });

            await message.reply({ embeds: [successEmbed] });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: 'Error',
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: 'Footer', iconURL: musicIcons.heartIcon })
                .setDescription('No results found for your query.');

            await message.reply({ embeds: [errorEmbed] });
        }

    } catch (error) {
        console.error(error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: 'Error',
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: 'made by hirako!', iconURL: musicIcons.heartIcon })
            .setDescription('There was an error processing your request.');

        await message.reply({ embeds: [errorEmbed] });
    }
}

module.exports = {
    name: "play",
    description: "Play a song from a name or link",
    run: play
};
