// noinspection JSUnusedGlobalSymbols

import {
  ChatInputCommandInteraction,
  ColorResolvable,
  SlashCommandBuilder,
} from "discord.js";
import {runVerifications} from "../functions";
import { SlashCommand } from "../types";
import {buildSimpleEmbed} from "../factories/embed-factory";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause current song."),
  execute: async (interaction) => {
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

    queue!!.pause();
    const embed = buildSimpleEmbed(COLOR_DEFAULT, `⏸ | Paused!`);
    await interaction.reply({
      embeds: [embed],
    });
  },
  cooldown: 10,
};


export default command