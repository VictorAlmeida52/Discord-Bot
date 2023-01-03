// noinspection JSUnusedGlobalSymbols

import {
  SlashCommandBuilder,
  ChannelType,
  ColorResolvable,
  ChatInputCommandInteraction,

} from "discord.js";
import {runVerifications} from "../functions";
import { SlashCommand } from "../types";
import {buildSimpleEmbed} from "../factories/embed-factory";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

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
    const { client } = interaction;

    // need verification before performing action
    const canUseCommand = await runVerifications(interaction, {
      verifyVoiceChannel: true,
      verifyQueue: true,
      verifyOnBotVoiceChannel: true
    })
    if (!canUseCommand) return;

    const queue = interaction.client.distube.getQueue(
        interaction as ChatInputCommandInteraction
    );

    const id = Number(interaction.options.get("id")?.value);

    let song = queue!!.songs.splice(id - 1, 1);
    await interaction.reply({
      embeds: [buildSimpleEmbed(COLOR_DEFAULT, `✅ | Success`, 'Remove song', client.user?.displayAvatarURL())],
      ephemeral: true,
    });
    const msg = await queue!!.textChannel?.send({
      embeds: [buildSimpleEmbed(COLOR_DEFAULT, `🎵 | Removed ${song[0].name} from the playlist!`, 'Removed Song', client.user?.displayAvatarURL())],
    });
    setTimeout(() => {
      msg?.delete();
    }, 5000);
  },
  cooldown: 10,
};


export default command