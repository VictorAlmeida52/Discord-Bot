// noinspection JSUnusedGlobalSymbols

import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const command : SlashCommand = {
    command: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Deletes messages from the current channel.")
    .addIntegerOption(option => {
        return option
        .setMaxValue(100)
        .setMinValue(1)
        .setName("count")
        .setDescription("Message amount to be cleared")
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: interaction => {
        let messageCount = Number(interaction.options.get("count")?.value)
        interaction.channel?.messages.fetch({limit: messageCount})
        .then(async msgs => {
            if(interaction.channel?.type === ChannelType.DM) return;
            const deletedMessages = await interaction.channel?.bulkDelete(msgs,true)   
            if (deletedMessages?.size === 0) await interaction.reply("No messages were deleted.")
            else await interaction.reply(`Successfully deleted ${deletedMessages?.size} message(s)`)
            setTimeout(() => interaction.deleteReply(), 5000)
        })
    },
    cooldown: 10
}

export default command