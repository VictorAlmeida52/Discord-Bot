import {ColorResolvable, EmbedBuilder, GuildMember} from "discord.js";
import {Queue, Song} from "distube";

const Format = Intl.NumberFormat();
const status = (queue: Queue) =>
    `Volume: \`${queue.volume}%\` | Filter: \`${
        queue.filters.names.join(", ") || "Off"
    }\` | Repeat: \`${
        queue.repeatMode ? (queue.repeatMode === 2 ? "List" : "Song") : "Off"
    }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

export const buildErrorEmbed = (color: ColorResolvable, message: string, icon?: string) => {
    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: "Error",
            iconURL: icon,
        })
        .setDescription(`🚫 | ${message}`)
}

export const buildSimpleEmbed = (color: ColorResolvable, message: string, author?: string, icon?: string) => {

    const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(message)

    if (icon && author) {
        embed.setAuthor({
            name: author,
            iconURL: icon,
        })
    }
    return embed
}

export const buildPreviousSongEmbed = (color: ColorResolvable, icon?: string) => {
    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: "Playback",
            iconURL: icon,
        })
        .setDescription(`🎵 | Playing the previous song!`)
}

export const buildLoopEmbed = (color: ColorResolvable, mode: string, icon?: string) => {
    let message = ''
    if (mode === 'off') message = `🔁 | Repeat mode is now off`
    if (mode === 'song') message = `🔁 | Enabled song loop`
    if (mode === 'list') message = `🔁 | Enabled playlist loop`
    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: "Repeat mode",
            iconURL: icon,
        })
        .setDescription(message)
}

export const createNowPlayingEmbed = (song: Song, queue: Queue, color: ColorResolvable, icon?: string) => {
    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: "Now Playing",
            iconURL: icon,
        })
        .setDescription(`> [${song.name}](${song.url})`)
        .addFields([
            {
                name: "🔷 | Status",
                value: `${status(queue).toString()}`,
                inline: false,
            },
            {
                name: "👀 | Views",
                value: `${Format.format(song.views)}`,
                inline: true,
            },
            {
                name: "👍 | Likes",
                value: `${Format.format(song.likes)}`,
                inline: true,
            },
            {
                name: "⏱️ | Duration",
                value: `${queue.formattedCurrentTime} / ${song.formattedDuration}`,
                inline: true,
            },
            {
                name: "🎵 | Uploader",
                value: `[${song.uploader.name}](${song.uploader.url})`,
                inline: true,
            },
            {
                name: "💾 | Download",
                value: `[Click to download](${song.streamURL})`,
                inline: true,
            },
            {
                name: "👌 | Requested by",
                value: `${song.user}`,
                inline: true,
            },
        ])
        .setImage(song.thumbnail ?? null)
        .setFooter({
            text: `${Format.format(queue.songs.length)} songs in queue`,
        });
};

export const createQueueEmbed = (tracks: string[], songs: number, queue: Queue, page: number, totalPages: number, color: ColorResolvable, icon?: string) => {
    const pages = `Page **${page}/${totalPages}**`;
    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: "Queue",
            iconURL: icon,
        })
        .setDescription(
            `${tracks.slice(10 * (page - 1), 10 * page).join("\n")}\n\n${pages}`
        )
        .addFields([
            {
                name: "> Playing:",
                value: `[${queue.songs[0].name}](${queue.songs[0].url}) - ${queue.songs[0].formattedDuration} | Request by: ${queue.songs[0].user}`,
                inline: true,
            },
            {
                name: "> Total time:",
                value: `${queue.formattedDuration}`,
                inline: true,
            },
            {
                name: "> Songs in queue:",
                value: `${songs}`,
                inline: true,
            },
        ]);
};

export const buildAvatarEmbed = (target: GuildMember, serverAvatar: string | null | undefined, requestedBy: {name: string, icon?: string}, authorAvatar?: string) => {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: `Avatar`,
            iconURL: authorAvatar,
        })
        .setDescription(`> 📦 | ${target}`)
        .setImage(
            serverAvatar ||
            target.user.displayAvatarURL({ size: 1024 })
        )
        .setColor(target.displayHexColor)
        .setFooter({
            text: `Requested by: ${requestedBy.name}`,
            iconURL: requestedBy.icon,
        })
        .setTimestamp();

    if (serverAvatar) {
        embed.setThumbnail(
            target.user.displayAvatarURL({ size: 512 })
        );
    }

    return embed
}