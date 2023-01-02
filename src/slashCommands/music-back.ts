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
  Client,
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

const buildEmbed = (client: Client) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Playback",
      iconURL: client.user?.displayAvatarURL() ?? undefined,
    })
    .setDescription(`🎵 | Playing the previous song!`);
};

const buildEmbedError = (client: Client) => {
  return new EmbedBuilder()
    .setColor(COLOR_ERROR)
    .setAuthor({
      name: "Error",
      iconURL: client.user?.displayAvatarURL() ?? undefined,
    })
    .setDescription(`🚫 | The previous song in the playlist cannot be played!`);
};

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("back")
    .setDescription("Go back to the previous song!"),
  execute: async (interaction) => {
    const { guild, member, client } = interaction;

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

    try {
      await client.distube.previous(interaction as ChatInputCommandInteraction);
      await interaction.reply({
        embeds: [buildEmbed(client)],
      });
    } catch (error) {
      await interaction.reply({
        embeds: [buildEmbedError(client)],
        ephemeral: true,
      });
    }
  },
  cooldown: 10,
};

export default command;
