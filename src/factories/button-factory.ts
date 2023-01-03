import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export const createQueueButtons = (currentPage: number, totalPages: number) => {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
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
};