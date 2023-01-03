// noinspection JSUnusedGlobalSymbols

import {
  SlashCommandBuilder,
  ColorResolvable,
  ChatInputCommandInteraction,
} from "discord.js";
import {runVerifications} from "../functions";
import { SlashCommand } from "../types";
import {buildSimpleEmbed} from "../factories/embed-factory";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change the volume of the currently playing song (0-200)!")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription(
          "Change the volume of the currently playing song (0-200)!"
        )
        .setMaxValue(200)
        .setMinValue(0)
        .setRequired(true)
    ),
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

    const volume = Number(interaction.options.get("volume")?.value);

    queue!!.setVolume(volume);
    await interaction.reply({
      embeds: [buildSimpleEmbed(COLOR_DEFAULT, `✅ | The volume has been changed to: ${volume}%/200%`)],
    });
  },
  cooldown: 10,
};


export default command