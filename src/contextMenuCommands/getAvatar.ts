// noinspection JSUnusedGlobalSymbols

import {
    ChannelType,
    GuildMember, ContextMenuCommandBuilder, ApplicationCommandType
} from "discord.js";
import {ContextMenuCommand} from "../types";
import {buildAvatarEmbed} from "../factories/embed-factory";

const command: ContextMenuCommand = {
    command: new ContextMenuCommandBuilder()
        .setName("Get Avatar")
        .setType(ApplicationCommandType.User),
    execute: async (interaction) => {
        const { guild, targetId, member, user } = interaction;

        await interaction.deferReply()

        const target = await guild?.members.fetch(targetId);
        const serverAvatar =
            target?.avatar &&
            `https://cdn.discordapp.com/guilds/${guild?.id}/users/${target.id}/avatars/${target.avatar}.png?size=512`;

        const embed = buildAvatarEmbed(target as GuildMember, serverAvatar, { name: (member as GuildMember).displayName, icon: user.displayAvatarURL() })
        await interaction.editReply({ embeds: [embed] })

    },
};


export default command