import {
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandBuilder,
} from "discord.js";
import { color } from "../functions";
import { SlashCommand } from "../types";

const COLOR_ERROR = process.env.COLOR_ERROR as ColorResolvable;
const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const replyNotInVoiceChannel = (interaction: ChatInputCommandInteraction) => {
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLOR_ERROR)
        .setDescription(
          `🚫 | You must be in a voice channel to use this command!`
        ),
    ],
    ephemeral: true,
  });
};

const replyNotOnBotChannel = (interaction: ChatInputCommandInteraction) => {
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLOR_ERROR)
        .setDescription(
          `🚫 | You need to be on the same voice channel as the Bot!`
        ),
    ],
    ephemeral: true,
  });
};

const PlayCommand: SlashCommand = {
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
    const { options, guild, member, channel } = interaction;

    // need verification before performing action
    const voiceChannel = (member as GuildMember).voice.channel;
    const queue = interaction.client.distube.getQueue(
      interaction as ChatInputCommandInteraction
    );

    const song = options.get("song")?.value?.toString() ?? "";

    if (!voiceChannel)
      return replyNotInVoiceChannel(interaction as ChatInputCommandInteraction);
    if (queue)
      if (
        guild?.members.me?.voice.channelId !==
        (member as GuildMember).voice.channelId
      )
        return replyNotOnBotChannel(interaction as ChatInputCommandInteraction);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLOR_DEFAULT)
          .setDescription(`🔍 | Looking for a song...`),
      ],
      ephemeral: true,
    });

    try {
      await interaction.client.distube.play(voiceChannel, song, {
        textChannel: channel as GuildTextBasedChannel,
        member: member as GuildMember,
      });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR_DEFAULT)
            .setDescription(`🔍 | Successful search!`),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR_ERROR)
            .setDescription(`🚫 | Não foi possível adicionar à fila!`),
        ],
      });
    }
  },
  cooldown: 10,
};

export default PlayCommand;
