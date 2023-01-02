import {
  ChatInputCommandInteraction,
  Client,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Queue, Song } from "distube";
import { SlashCommand } from "../types";

const Format = Intl.NumberFormat();
const status = (queue: Queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${
    queue.filters.names.join(", ") || "Off"
  }\` | Repeat: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? "List" : "Song") : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

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

const createEmbedNowPlaying = (song: Song, queue: Queue, client: Client) => {
  const embed = new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Now Playing",
      iconURL: client.user?.displayAvatarURL(),
    })
    .setDescription(`> [${song.name}](${song.url})`)
    .addFields([
      {
        name: "🔷 | Status",
        value: `${status(queue).toString()}`,
        inline: false,
      },
      {
        name: "👀 | Views",
        value: `${Format.format(song.views)}`,
        inline: true,
      },
      {
        name: "👍 | Likes",
        value: `${Format.format(song.likes)}`,
        inline: true,
      },
      {
        name: "⏱️ | Duration",
        value: `${queue.formattedCurrentTime} / ${song.formattedDuration}`,
        inline: true,
      },
      {
        name: "🎵 | Uploader",
        value: `[${song.uploader.name}](${song.uploader.url})`,
        inline: true,
      },
      {
        name: "💾 | Dowload",
        value: `[Click to download](${song.streamURL})`,
        inline: true,
      },
      {
        name: "👌 | Request by",
        value: `${song.user}`,
        inline: true,
      },
    ])
    .setImage(song.thumbnail ?? null)
    .setFooter({
      text: `${Format.format(queue.songs.length)} songs in queue`,
    });
  return embed;
};

const PlayCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing song."),
  execute: async (interaction) => {
    const { guild, member, client } =
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

    const song = queue.songs[0];
    const embed = createEmbedNowPlaying(song, queue, client);

    await interaction.reply({ embeds: [embed] });
  },
  cooldown: 10,
};

export default PlayCommand;
