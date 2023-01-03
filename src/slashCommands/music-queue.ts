// noinspection JSUnusedGlobalSymbols

import {
  ChatInputCommandInteraction,
  ColorResolvable,
  SlashCommandBuilder,
  ButtonInteraction,
} from "discord.js";
import { SlashCommand } from "../types";
import {runVerifications} from "../functions";
import {createQueueEmbed} from "../factories/embed-factory";
import {createQueueButtons} from "../factories/button-factory";

const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;



const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("See the list of songs in the queue."),
  execute: async (interaction) => {
    const { client } =
      interaction as ChatInputCommandInteraction;

    // need verification before performing action
    const queue = interaction.client.distube.getQueue(
      interaction as ChatInputCommandInteraction
    );

    const canUseCommand = await runVerifications(interaction, {
      verifyVoiceChannel: true,
      verifyQueue: true,
      verifyOnBotVoiceChannel: true
    })
    if (!canUseCommand) return;

    const tracks = queue!!.songs.map(
      (song, i) => `**${i + 1}** - [${song.name}](${song.url}) | ${
        song.formattedDuration
      }
          Requested by: ${song.user}`
    );

    const songs = queue!!.songs.length;

    let currPage = 1;
    let totalPages = Math.ceil(songs / 10);

    const buttons = createQueueButtons(currPage, totalPages);
    let embed = createQueueEmbed(tracks, songs, queue!!, currPage, totalPages, COLOR_DEFAULT, client.user?.displayAvatarURL());
    const message = await (interaction as ChatInputCommandInteraction).reply({
      embeds: [embed],
      components: [buttons],
    });

    // listen to buttons for 5 minutes
    const collector = message.createMessageComponentCollector({
      time: 300000,
      dispose: true,
    });
    collector.on("collect", async (i: ButtonInteraction) => {
      if (i.customId === "queue_back") {
        currPage -= 1;
        embed = createQueueEmbed(tracks, songs, queue!!, currPage, totalPages, COLOR_DEFAULT, client.user?.displayAvatarURL())
        await i.update({
          embeds: [embed],
          components: [createQueueButtons(currPage, totalPages)],
        });
      }
      if (i.customId === "queue_next") {
        currPage += 1;
        embed = createQueueEmbed(tracks, songs, queue!!, currPage, totalPages, COLOR_DEFAULT, client.user?.displayAvatarURL())
        await i.update({
          embeds: [embed],
          components: [createQueueButtons(currPage, totalPages)],
        });
      }
    });
  },
  cooldown: 10,
};


export default command