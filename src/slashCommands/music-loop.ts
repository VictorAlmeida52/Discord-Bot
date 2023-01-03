// noinspection JSUnusedGlobalSymbols

import {
  SlashCommandBuilder,
  ChannelType,
  ColorResolvable,
  ChatInputCommandInteraction,
} from "discord.js";
import { runVerifications} from "../functions";
import { SlashCommand } from "../types";
import {buildLoopEmbed} from "../factories/embed-factory";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Apply filter to the queue")
    .addStringOption((option) => {
      return option
        .setName("type")
        .setDescription("Choose the type of loop")
        .setRequired(true)
        .setAutocomplete(true);
    }),
  autocomplete: async (interaction) => {
    const { options } = interaction;

    const focusedValue = options.getFocused();
    const choices = [
      "Turn off repeat mode",
      "Repeat the song",
      "Repeat song list",
    ];
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  execute: async (interaction) => {
    const { options, client } =
      interaction as ChatInputCommandInteraction;

    // need verification before performing action
    const canUseCommand = await runVerifications(interaction, {
      verifyVoiceChannel: true,
      verifyQueue: true,
      verifyOnBotVoiceChannel: true
    })
    if (!canUseCommand) return;

    const queue = interaction.client.distube.getQueue(
        interaction as ChatInputCommandInteraction
    );

    const loop = options.get("type")?.value?.toString() ?? "";

    if (loop === "Turn off repeat mode") {
      queue!!.setRepeatMode(0);
      await interaction.reply({
        embeds: [buildLoopEmbed(COLOR_DEFAULT, 'off', client.user?.displayAvatarURL())],
      });
    } else if (loop === "Repeat the song") {
      queue!!.setRepeatMode(1);
      await interaction.reply({
        embeds: [buildLoopEmbed(COLOR_DEFAULT, 'song', client.user?.displayAvatarURL())],
      });
    } else if (loop === "Repeat song list") {
      queue!!.setRepeatMode(2);
      await interaction.reply({
        embeds: [buildLoopEmbed(COLOR_DEFAULT, 'list', client.user?.displayAvatarURL())],
      });
    }
  },
  cooldown: 10,
};


export default command