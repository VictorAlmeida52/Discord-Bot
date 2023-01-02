import {
  ChatInputCommandInteraction,
  Client,
  ColorResolvable,
  EmbedBuilder,
  GuildTextBasedChannel,
} from "discord.js";
import { BotEvent } from "../types";
import { color } from "../functions";
import { Queue, Song } from "distube";

const COLOR_ERROR = process.env.COLOR_ERROR as ColorResolvable;
const Format = Intl.NumberFormat();

const buildEmbed = (error: Error) => {
  return new EmbedBuilder()
    .setColor(COLOR_ERROR)
    .setDescription(
      `🚫 | An error has occurred!\n\n** ${error.toString().slice(0, 1974)}**`
    );
};

const event: BotEvent = {
  name: "error",
  distube: true,
  execute: async (channel: GuildTextBasedChannel, error: Error) => {
    const embed = buildEmbed(error);
    try {
      const msg = await channel.send({
        embeds: [embed],
      });

      setTimeout(() => {
        msg?.delete();
      }, 20000);

      console.log(
        color(
          "text",
          `🚫 An error has occurred!\n\n** ${error.toString().slice(0, 1974)}**`
        )
      );
    } catch (error) {
      console.log(error);
    }
  },
};

export default event;
