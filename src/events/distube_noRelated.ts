// noinspection JSUnusedGlobalSymbols

import {
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { BotEvent } from "../types";
import { Queue } from "distube";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const buildEmbed = () => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setDescription(`🚫 | Song not found!`);
};

const event: BotEvent = {
  name: "noRelated",
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


export default event