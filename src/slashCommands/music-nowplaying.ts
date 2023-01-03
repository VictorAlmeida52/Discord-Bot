// noinspection JSUnusedGlobalSymbols

import {
  ChatInputCommandInteraction,
  ColorResolvable,
  SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../types";
import {runVerifications} from "../functions";
import {createNowPlayingEmbed} from "../factories/embed-factory";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("now-playing")
    .setDescription("Show the currently playing song."),
  execute: async (interaction) => {
    const { client } =
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

    const song = queue!!.songs[0];
    const embed = createNowPlayingEmbed(song, queue!!, COLOR_DEFAULT, client.user?.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  },
  cooldown: 10,
};


export default command