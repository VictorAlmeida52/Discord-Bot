// noinspection JSUnusedGlobalSymbols

import {PermissionFlagsBits} from "discord.js";
import {unregisterCommands} from "../functions";
import {Command} from "../types";

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const ownerId = process.env.OWNER_ID;

const command: Command = {
    name: "unregister",
    execute: async (message, args) => {
        const {guildId, client, member} = message;
        const [cmdName, mode] = args

        if(!member) return
        if (!(member.id.valueOf() === ownerId)) return;

        if (!mode) {
            return message.channel.send(`Usage: ${cmdName} [global/guild]`);
        }

        if (mode === 'guild') {
            if (!guildId) return;
            if (!member?.permissions.has('Administrator'))
                message.channel.send(`You need to have administrator permissions to run this command`)
            await unregisterCommands(client, token, clientId, {type: 'guild', guildId})
            message.channel.send(`Unloading guild slash commands...`);
        } else if (mode === 'global') {
            await unregisterCommands(client, token, clientId, {type: 'global'})
            message.channel.send(`Unloading global slash commands...`);
        } else {
            message.channel.send(`Invalid mode.`);
        }
    },
    aliases: [""],
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers], // to test
};


export default command