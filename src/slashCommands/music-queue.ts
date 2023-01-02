import {
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonInteraction,
} from "discord.js";
import { Queue } from "distube";
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

const createQueueEmbed = (
  tracks: string[],
  songs: number,
  queue: Queue,
  client: Client,
  page: number,
  totalPages: number
) => {
  const pages = `Page **${page}/${totalPages}**`;
  const embed = new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Queue",
      iconURL: client.user?.displayAvatarURL(),
    })
    .setDescription(
      `${tracks.slice(10 * (page - 1), 10 * page).join("\n")}\n\n${pages}`
    )
    .addFields([
      {
        name: "> Playing:",
        value: `[${queue.songs[0].name}](${queue.songs[0].url}) - ${queue.songs[0].formattedDuration} | Request by: ${queue.songs[0].user}`,
        inline: true,
      },
      {
        name: "> Total time:",
        value: `${queue.formattedDuration}`,
        inline: true,
      },
      {
        name: "> Songs in queue:",
        value: `${songs}`,
        inline: true,
      },
    ]);
  return embed;
};

const createQueueButton = (currentPage: number, totalPages: number) => {
  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("queue_back")
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage <= 1),
    new ButtonBuilder()
      .setCustomId("queue_next")
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= totalPages)
  );
  return button;
};

const PlayCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("See the list of songs in the queue."),
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

    const tracks = queue.songs.map(
      (song, i) => `**${i + 1}** - [${song.name}](${song.url}) | ${
        song.formattedDuration
      }
          Requested by: ${song.user}`
    );

    const songs = queue.songs.length;

    let currPage = 1;
    let totalPages = Math.ceil(songs / 10);

    const buttons = createQueueButton(currPage, totalPages);
    const message = await (interaction as ChatInputCommandInteraction).reply({
      embeds: [
        createQueueEmbed(tracks, songs, queue, client, currPage, totalPages),
      ],
      components: [buttons],
    });

    const collector = message.createMessageComponentCollector({
      time: 300000,
      dispose: true,
    });
    collector.on("collect", async (i: ButtonInteraction) => {
      if (i.customId === "queue_back") {
        currPage -= 1;
        await i.update({
          embeds: [
            createQueueEmbed(
              tracks,
              songs,
              queue,
              client,
              currPage,
              totalPages
            ),
          ],
          components: [createQueueButton(currPage, totalPages)],
        });
      }
      if (i.customId === "queue_next") {
        currPage += 1;
        await i.update({
          embeds: [
            createQueueEmbed(
              tracks,
              songs,
              queue,
              client,
              currPage,
              totalPages
            ),
          ],
          components: [createQueueButton(currPage, totalPages)],
        });
      }
    });
  },
  cooldown: 10,
};

export default PlayCommand;
