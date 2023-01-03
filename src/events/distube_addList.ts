// noinspection JSUnusedGlobalSymbols

import {
  Client,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { BotEvent } from "../types";
import { Playlist, Queue } from "distube";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;
const Format = Intl.NumberFormat();

const buildEmbed = (client: Client, playlist: Playlist, queue: Queue) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Added playlist to queue",
      iconURL: client.user?.avatarURL() ?? undefined,
    })
    .setDescription(`> [**${playlist.name}**](${playlist.url})`)
    .addFields([
      {
        name: "⏱️ | Time",
        value: `${playlist.formattedDuration}`,
        inline: true,
      },
      {
        name: "👌 | Requested by",
        value: `${playlist.user}`,
        inline: true,
      },
    ])
    .setImage(playlist.thumbnail ?? null)
    .setFooter({
      text: `${Format.format(queue.songs.length)} songs in queue`,
    });
};

const event: BotEvent = {
  name: "addList",
  distube: true,
  execute: async (queue: Queue, playlist: Playlist, client: Client) => {
    const embed = buildEmbed(client, playlist, queue);
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


export default event