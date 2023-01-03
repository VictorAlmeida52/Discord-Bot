import chalk from "chalk";
import {
    ChatInputCommandInteraction,
    Client,
    ColorResolvable,
    CommandInteraction,
    Guild,
    GuildMember,
    PermissionFlagsBits,
    PermissionResolvable,
    Routes,
    SlashCommandBuilder,
    TextChannel
} from "discord.js";
import GuildDB from "./schemas/Guild";
import {CommandRegistrationOptions, GuildOption, SlashCommand} from "./types";
import mongoose from "mongoose";
import {REST} from "discord.js";
import {join} from "path";
import {readdirSync} from "fs";
import {buildErrorEmbed} from "./factories/embed-factory";

type colorType = "text" | "variable" | "error";

const themeColors = {
    text: "#ff8e4d",
    variable: "#ff624d",
    error: "#f5426c",
};

export const getThemeColor = (color: colorType) =>
    Number(`0x${themeColors[color].substring(1)}`);

export const color = (color: colorType, message: any) => {
    return chalk.hex(themeColors[color])(message);
};

export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
    let neededPermissions: PermissionResolvable[] = [];
    permissions.forEach((permission) => {
        if (!member.permissions.has(permission)) neededPermissions.push(permission);
    });
    if (neededPermissions.length === 0) return null;
    return neededPermissions.map((p) => {
        if (typeof p === "string") return p.split(/(?=[A-Z])/).join(" ");
        else
            return Object.keys(PermissionFlagsBits)
                .find((k) => Object(PermissionFlagsBits)[k] === p)
                ?.split(/(?=[A-Z])/)
                .join(" ");
    });
};

export const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
    channel
        .send(message)
        .then((m) =>
            setTimeout(
                async () => (await channel.messages.fetch(m)).delete(),
                duration
            )
        );
    return;
};

export const getGuildOption = async (guild: Guild, option: GuildOption) => {
    if (mongoose.connection.readyState === 0)
        throw new Error("Database not connected.");
    let foundGuild = await GuildDB.findOne({guildID: guild.id});
    if (!foundGuild) return null;
    return foundGuild.options[option];
};

export const setGuildOption = async (guild: Guild, option: GuildOption, value: any) => {
    if (mongoose.connection.readyState === 0)
        throw new Error("Database not connected.");
    let foundGuild = await GuildDB.findOne({guildID: guild.id});
    if (!foundGuild) return null;
    foundGuild.options[option] = value;
    foundGuild.save();
};

const getRoute = (clientId: string, options: CommandRegistrationOptions): `/applications/${string}/guilds/${string}/commands` | `/applications/${string}/commands` | null => {
    const {type, guildId} = options

    let route: `/applications/${string}/guilds/${string}/commands` | `/applications/${string}/commands`;
    if (type === 'guild') {
        if (!guildId) return null;
        route = Routes.applicationGuildCommands(clientId, guildId)
    } else {
        route = Routes.applicationCommands(clientId)
    }

    return route;
}

export const unregisterCommands = async (client: Client, token: string, clientId: string, options: CommandRegistrationOptions) => {
    const rest = new REST({version: "9"}).setToken(token);

    const route = getRoute(clientId, options);
    if (!route) return;

    rest
        .get(route)
        .then((data: any) => {
            const promises: any[] = [];
            for (const command of data) {
                const deleteUrl: `/${string}` = `${route}/${command.id}`
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
};

export const registerCommands = async (client: Client, token: string, clientId: string, options: CommandRegistrationOptions) => {
    const rest = new REST({version: "9"}).setToken(token);

    const route = getRoute(clientId, options);
    if (!route) return;

    const slashCommands: SlashCommandBuilder[] = [];
    let slashCommandsDir = join(__dirname, "./slashCommands");

    readdirSync(slashCommandsDir).forEach((file) => {
        if (!file.endsWith(".js")) return;
        let command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
        slashCommands.push(command.command);
        client.slashCommands.set(command.command.name, command);
    });

    rest.put(route, {
        body: slashCommands.map((command) => command.toJSON()),
    })
        .then((data: any) => {
            console.log(color("text", `🔥 Successfully loaded ${color("variable", data.length)} slash command(s)`));
        })
        .catch((e) => {
            console.log(e);
        });
};

const replyInVoiceChannelVerification = (color: ColorResolvable, interaction: CommandInteraction) => {
    const embed = buildErrorEmbed(color, `🚫 | You must be in a voice channel to use this command!`);
    return interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}

const replyQueueEmptyVerification = (color: ColorResolvable, interaction: CommandInteraction) => {
    const embed = buildErrorEmbed(color, `🚫 | There is nothing on the queue!`);
    return interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}

const replyOnBotVoiceChannelVerification = (color: ColorResolvable, interaction: CommandInteraction) => {
    const embed = buildErrorEmbed(color, `🚫 | You need to be on the same voice channel as the Bot!`);
    return interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}


export interface VerificationOptions {
    verifyVoiceChannel: boolean;
    verifyQueue: boolean;
    verifyOnBotVoiceChannel: boolean;
}

export const runVerifications = async (interaction: CommandInteraction, verificationOptions: VerificationOptions) => {
    const {guild, member} = interaction;
    const {verifyVoiceChannel, verifyQueue, verifyOnBotVoiceChannel} = verificationOptions

    let canUseCommand = true;
    if (verifyVoiceChannel) {
        const voiceChannel = (member as GuildMember).voice.channel;
        if (!voiceChannel) {
            canUseCommand = false;
            await replyInVoiceChannelVerification(themeColors.error as ColorResolvable, interaction)
        }
    }

    if (verifyQueue) {
        const queue = interaction.client.distube.getQueue(interaction as ChatInputCommandInteraction);
        if (!queue) {
            canUseCommand = false;
            await replyQueueEmptyVerification(themeColors.error as ColorResolvable, interaction)
        }
    }

    if (verifyOnBotVoiceChannel) {
        if (guild?.members.me?.voice.channelId !== (member as GuildMember).voice.channelId) {
            canUseCommand = false;
            await replyOnBotVoiceChannelVerification(themeColors.error as ColorResolvable, interaction)
        }
    }

    return canUseCommand
}













