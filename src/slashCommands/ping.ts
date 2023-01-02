import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the bot's ping"),
  execute: async (interaction) => {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: "Ping" })
          .setColor(getThemeColor("text"))
          .addFields([
            {
              name: "> API Latency",
              value: `${interaction.client.ws.ping}ms`,
              inline: true,
            },
            {
              name: "> Discord Latency",
              value: `${
                message.createdTimestamp - interaction.createdTimestamp
              }ms`,
              inline: true,
            },
            {
              name: "> Uptime",
              value: `${Math.floor(process.uptime() * 1000)}ms`,
              inline: true,
            },
          ])
          .setTimestamp(),
      ],
    });
  },
  cooldown: 10,
};

export default command;
