import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  EmbedBuilder,
  ColorResolvable,
  ApplicationCommandChoicesData,
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
} from "discord.js";
import { Song } from "distube";
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

const replyQueueNotFound = (interaction: ChatInputCommandInteraction) => {
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLOR_ERROR)
        .setDescription(`🚫 | There is nothing on the queue!`),
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

const buildEmbed = (volume: number) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setDescription(`✅ | The volume has been changed to: ${volume}%/200%`);
};

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
    const { options, guild, member, client } = interaction;

    // need verification before performing action
    const voiceChannel = (member as GuildMember).voice.channel;
    const queue = interaction.client.distube.getQueue(
      interaction as ChatInputCommandInteraction
    );

    if (!voiceChannel)
      return replyNotInVoiceChannel(interaction as ChatInputCommandInteraction);
    if (!queue)
      return replyQueueNotFound(interaction as ChatInputCommandInteraction);
    if (
      guild?.members.me?.voice.channelId !==
      (member as GuildMember).voice.channelId
    )
      return replyNotOnBotChannel(interaction as ChatInputCommandInteraction);

    const volume = Number(interaction.options.get("volume")?.value);

    queue.setVolume(volume);
    await interaction.reply({
      embeds: [buildEmbed(volume)],
    });
  },
  cooldown: 10,
};

export default command;
