// noinspection JSUnusedGlobalSymbols

import {
    SlashCommandBuilder,
    ChannelType,
    ColorResolvable,
    ChatInputCommandInteraction,
} from "discord.js";
import {SlashCommand} from "../types";
import {buildErrorEmbed, buildPreviousSongEmbed} from "../factories/embed-factory";
import {runVerifications} from "../functions";

const COLOR_ERROR = process.env.COLOR_ERROR as ColorResolvable;
const COLOR_DEFAULT = process.env.COLOR_DEFAULT as ColorResolvable;

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("back")
        .setDescription("Go back to the previous song!"),
    execute: async (interaction) => {
        const {client} = interaction;

        // need verification before performing action
        const canUseCommand = await runVerifications(interaction, {
            verifyVoiceChannel: true,
            verifyQueue: true,
            verifyOnBotVoiceChannel: true
        })
        if (!canUseCommand) return;

        let embed;
        try {
            embed = buildPreviousSongEmbed(COLOR_DEFAULT, client.user?.displayAvatarURL())
            await client.distube.previous(interaction as ChatInputCommandInteraction);
            await interaction.reply({
                embeds: [embed],
            });
        } catch (error) {
            embed = buildErrorEmbed(COLOR_ERROR, 'The previous song in the playlist cannot be played', client.user?.displayAvatarURL())
            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    },
    cooldown: 10,
};


export default command