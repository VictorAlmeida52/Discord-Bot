import {
  ChatInputCommandInteraction,
  Client,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { BotEvent } from "../types";
import { color } from "../functions";
import { Queue, Song } from "distube";

const COLOR_ERROR = process.env.COLOR_ERROR as ColorResolvable;
const Format = Intl.NumberFormat();

const buildEmbed = () => {
  return new EmbedBuilder()
    .setColor(COLOR_ERROR)
    .setDescription(`🚫 | The bot has disconnected from the voice channel!`);
};

const event: BotEvent = {
  name: "disconnect",
  distube: true,
  execute: async (queue: Queue) => {
    const embed = buildEmbed();
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
