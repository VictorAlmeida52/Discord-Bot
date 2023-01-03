// noinspection JSUnusedGlobalSymbols

import {
  SlashCommandBuilder,
  ChannelType,
  ColorResolvable,
  ChatInputCommandInteraction,

} from "discord.js";
import {runVerifications} from "../functions";
import { SlashCommand } from "../types";
import {buildSimpleEmbed} from "../factories/embed-factory";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Apply filter to the queue")
    .addStringOption((option) => {
      return option
        .setName("filter")
        .setDescription("Filter the queue")
        .setRequired(true)
        .setAutocomplete(true);
    }),
  autocomplete: async (interaction) => {
    const { options } = interaction;

    const focusedValue = options.getFocused();
    const choices = [
      "off",
      "3d",
      "bassboost",
      "echo",
      "karaoke",
      "nightcore",
      "surround",
    ];
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  execute: async (interaction) => {
    const { client } = interaction;

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

    const filter = interaction.options.get("filter")?.value?.toString() ?? "";

    if (filter === "off" && queue!!.filters.size) queue!!.filters.clear();
    else if (Object.keys(client.distube.filters).includes(filter)) {
      if (queue!!.filters.has(filter)) queue!!.filters.remove(filter);
      else queue!!.filters.add(filter);
    }

    const embed = buildSimpleEmbed(COLOR_DEFAULT, `Filters \`${filter}\` have been updated!`)
    await interaction.reply({
      embeds: [embed],
    });
  },
  cooldown: 10,
};


export default command