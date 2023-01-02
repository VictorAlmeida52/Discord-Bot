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

const createEmbedRepeatModeOff = (client: Client) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Repeat mode",
      iconURL: client.user?.displayAvatarURL(),
    })
    .setDescription(`🔁 | Repeat mode is now off!`);
};

const createEmbedEnableLoop = (client: Client) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Repeat mode",
      iconURL: client.user?.displayAvatarURL(),
    })
    .setDescription(`🔁 | Enabled song loop!`);
};

const createEmbedEnablePlaylistLoop = (client: Client) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Repeat mode",
      iconURL: client.user?.displayAvatarURL(),
    })
    .setDescription(`🔁 | Enabled playlist loop!`);
};

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
    const { guild, member, options, client } =
      interaction as ChatInputCommandInteraction;

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

    const loop = options.get("type")?.value?.toString() ?? "";

    if (loop === "Turn off repeat mode") {
      queue.setRepeatMode(0);
      interaction.reply({
        embeds: [createEmbedRepeatModeOff(client)],
      });
    } else if (loop === "Repeat the song") {
      queue.setRepeatMode(1);
      interaction.reply({
        embeds: [createEmbedEnableLoop(client)],
      });
    } else if (loop === "Repeat song list") {
      queue.setRepeatMode(2);
      interaction.reply({
        embeds: [createEmbedEnablePlaylistLoop(client)],
      });
    }
  },
  cooldown: 10,
};

export default command;
