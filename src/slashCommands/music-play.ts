// noinspection JSUnusedGlobalSymbols

import {
  ChatInputCommandInteraction,
  ColorResolvable,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandBuilder,
} from "discord.js";
import {runVerifications} from "../functions";
import { SlashCommand } from "../types";
import {buildErrorEmbed, buildSimpleEmbed} from "../factories/embed-factory";

const COLOR_ERROR = process.env.COLOR_ERROR as ColorResolvable;
const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song.")
    .addStringOption((option) => {
      return option
        .setName("song")
        .setDescription("Song query or URL")
        .setRequired(true);
    }),
  execute: async (interaction) => {
    const { options, member, channel } = interaction;

    // need verification before performing action
    const voiceChannel = (member as GuildMember).voice.channel;
    const queue = interaction.client.distube.getQueue(
      interaction as ChatInputCommandInteraction
    );

    const song = options.get("song")?.value?.toString() ?? "";

    const canUseCommand = await runVerifications(interaction, {
      verifyOnBotVoiceChannel: !!queue,
      verifyQueue: !!queue,
      verifyVoiceChannel: true
    })
    if (!canUseCommand) return;

    await interaction.reply({
      embeds: [buildSimpleEmbed(COLOR_DEFAULT, `🔍 | Looking for a song...!`)],
      ephemeral: true,
    });

    try {
      await interaction.client.distube.play(voiceChannel!!, song, {
        textChannel: channel as GuildTextBasedChannel,
        member: member as GuildMember,
      });

      await interaction.editReply({
        embeds: [buildSimpleEmbed(COLOR_DEFAULT, `🔍 | Successful search!`)],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [buildErrorEmbed(COLOR_ERROR, 'Could not add to the queue')],
      });
    }
  },
  cooldown: 10,
};


export default command