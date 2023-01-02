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

const buildEmbed = (client: Client, song: Song, queue: Queue) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Added song to queue",
      iconURL: client.user?.avatarURL() ?? undefined,
    })
    .setDescription(`> [**${song.name}**](${song.url})`)
    .addFields([
      {
        name: "⏱️ | Time",
        value: `${song.formattedDuration}`,
        inline: true,
      },
      {
        name: "🎵 | Uploader",
        value: `[${song.uploader.name}](${song.uploader.url})`,
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

const event: BotEvent = {
  name: "addSong",
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
