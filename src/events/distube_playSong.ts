import {
  ChatInputCommandInteraction,
  Client,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { BotEvent } from "../types";
import { color } from "../functions";
import { Queue, Song } from "distube";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;
const Format = Intl.NumberFormat();
const status = (queue: Queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${
    queue.filters.names.join(", ") || "Off"
  }\` | Repeat: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? "List" : "Song") : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

const buildEmbed = (client: Client, song: Song, queue: Queue) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Now Playing",
      iconURL: client.user?.displayAvatarURL() ?? undefined,
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
        name: "💾 | Dowload",
        value: `[Click to download](${song.streamURL})`,
        inline: true,
      },
      {
        name: "👌 | Request by",
        value: `${song.user}`,
        inline: true,
      },
    ])
    .setImage(song.thumbnail ?? null)
    .setFooter({
      text: `${Format.format(queue.songs.length)} songs in queue`,
    });
};

const event: BotEvent = {
  name: "playSong",
  distube: true,
  execute: async (queue: Queue, song: Song, client: Client) => {
    const embed = buildEmbed(client, song, queue);
    try {
      const msg = await queue.textChannel?.send({
        embeds: [embed],
      });

      setTimeout(() => {
        msg?.delete();
      }, 20000);
    } catch (error) {
      console.log(error);
    }
  },
};

export default event;
