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

const buildEmbedSuccess = (client: Client) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Resume",
      iconURL: client.user?.displayAvatarURL(),
    })
    .setDescription(`✅ | Success`);
};

const buildEmbed = (client: Client, song: Song[]) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: "Removed song",
      iconURL: client.user?.displayAvatarURL(),
    })
    .setDescription(`🎵 | Removed ${song[0].name} from the playlist!`);
};

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove song from queue")
    .addNumberOption((option) => {
      return option
        .setName("id")
        .setDescription("ID")
        .setRequired(false)
        .setAutocomplete(true);
    }),
  autocomplete: async (interaction) => {
    const { options, client } = interaction;

    const focusedValue = options.getFocused();
    const queue = client.distube.getQueue(interaction);

    if (!queue) return;
    if (queue.songs.length > 25) {
      const tracks = queue.songs
        .map((song, i) => {
          return {
            name: `${i + 1}. ${song.name}`,
            value: i + 1,
          };
        })
        .slice(0, 25);
      const filtered = tracks.filter((track) =>
        track.name.startsWith(focusedValue)
      );
      await interaction.respond(
        filtered.map((track) => ({
          name: track.name,
          value: track.value,
        }))
      );
    } else {
      const tracks = queue.songs
        .map((song, i) => {
          return {
            name: `${i + 1}. ${song.name}`,
            value: i + 1,
          };
        })
        .slice(0, queue.songs.length);
      const filtered = tracks.filter((track) =>
        track.name.startsWith(focusedValue)
      );
      await interaction.respond(
        filtered.map((track) => ({
          name: track.name,
          value: track.value,
        }))
      );
    }
  },
  execute: async (interaction) => {
    const { guild, member, options, client } = interaction;

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

    const id = Number(interaction.options.get("id")?.value);

    let song = queue.songs.splice(id - 1, 1);
    await interaction.reply({
      embeds: [buildEmbedSuccess(client)],
      ephemeral: true,
    });
    const msg = await queue.textChannel?.send({
      embeds: [buildEmbed(client, song)],
    });
    setTimeout(() => {
      msg?.delete();
    }, 5000);
  },
  cooldown: 10,
};

export default command;
