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

const buildEmbed = (filter: string) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setDescription(`Filters \`${filter}\` have been updated!`);
};

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

    const filter = interaction.options.get("filter")?.value?.toString() ?? "";

    if (filter === "off" && queue.filters.size) queue.filters.clear();
    else if (Object.keys(client.distube.filters).includes(filter)) {
      if (queue.filters.has(filter)) queue.filters.remove;
      else queue.filters.add(filter);
    }

    interaction.reply({
      embeds: [buildEmbed(filter)],
    });
  },
  cooldown: 10,
};

export default command;
