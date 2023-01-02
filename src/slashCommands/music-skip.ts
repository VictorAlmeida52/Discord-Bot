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

const buildEmbedSimple = () => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setDescription(`⏩ | Skipped!`);
};

const buildEmbedWithId = (id: number, songSkip: Song) => {
  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setDescription(`⏩ | Moved to song with ID: ${id}: **${songSkip.name}**!`);
};

const buildEmbedError = (id: number) => {
  return new EmbedBuilder()
    .setColor(COLOR_ERROR)
    .setDescription(`🚫 | Songs with ID not found: ${id}!`);
};

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip")
    .addNumberOption((option) => {
      return option
        .setName("id")
        .setDescription("ID")
        .setRequired(false)
        .setAutocomplete(true);
    }),
  autocomplete: async (interaction) => {
    const { client } = interaction;
    try {
      const focusedValue = interaction.options.getFocused();
      const queue = client.distube.getQueue(interaction);

      if (!queue?.songs.length) return;
      if (queue.songs.length > 25) {
        const tracks = queue.songs
          .map((song, i) => {
            return {
              name: `${i + 1}. ${song.name}`,
              value: i + 1,
            };
          })
          .splice(0, 25);

        const filtered = tracks.filter((track) =>
          track.name.startsWith(focusedValue)
        );

        return await interaction.respond(
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

        return await interaction.respond(
          filtered.map((track) => ({
            name: track.name,
            value: track.value,
          }))
        );
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  },
  execute: async (interaction) => {
    const { guild, member } = interaction;

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

    if (!id) {
      await queue.skip();
      return await interaction.reply({
        embeds: [buildEmbedSimple()],
      });
    }

    if (id) {
      try {
        const songSkip = queue.songs[id - 1];
        await interaction.client.distube.jump(
          interaction as ChatInputCommandInteraction,
          id - 1
        );
        await interaction.reply({
          embeds: [buildEmbedWithId(id, songSkip)],
        });
      } catch (err) {
        console.log(err);
        await interaction.reply({
          embeds: [buildEmbedError(id)],
          ephemeral: true,
        });
      }
    }
  },
  cooldown: 10,
};

export default command;
