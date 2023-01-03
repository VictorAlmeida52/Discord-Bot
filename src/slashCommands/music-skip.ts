// noinspection JSUnusedGlobalSymbols

import {
  SlashCommandBuilder,
  ColorResolvable,
  ChatInputCommandInteraction,

} from "discord.js";
import {runVerifications} from "../functions";
import { SlashCommand } from "../types";
import {buildErrorEmbed, buildSimpleEmbed} from "../factories/embed-factory";

const COLOR_ERROR = process.env.COLOR_ERROR as ColorResolvable;
const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;


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

    if (!id) {
      await queue!!.skip();
      return await interaction.reply({
        embeds: [buildSimpleEmbed(COLOR_DEFAULT, `⏩ | Skipped!`)],
      });
    }

    if (id) {
      try {
        const songSkip = queue!!.songs[id - 1];
        await interaction.client.distube.jump(
          interaction as ChatInputCommandInteraction,
          id - 1
        );
        await interaction.reply({
          embeds: [buildSimpleEmbed(COLOR_DEFAULT, `⏩ | Moved to song with ID: ${id}: **${songSkip.name}**!`)],
        });
      } catch (err) {
        console.log(err);
        await interaction.reply({
          embeds: [buildErrorEmbed(COLOR_ERROR, `🚫 | Songs with ID not found: ${id}!`)],
          ephemeral: true,
        });
      }
    }
  },
  cooldown: 10,
};


export default command