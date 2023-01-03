import {PermissionFlagsBits} from "discord.js";
import {Command} from "../types";
import {registerCommands} from "../functions";

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

const command: Command = {
    name: "register",
    execute: async (message, args) => {
        const {guildId, client, member} = message;
        const [cmdName, mode] = args

        if (!mode) {
            return message.channel.send(`Usage: ${cmdName} [global/guild]`);
        }

        if (mode === 'guild') {
            if (!guildId) return;
            if (!member?.permissions.has('Administrator'))
                message.channel.send(`You need to have administrator permissions to run this command`)
            await registerCommands(client, token, clientId, {type: 'guild', guildId})
            message.channel.send(`Reloading guild slash commands...`);
        } else if (mode === 'global') {
            await registerCommands(client, token, clientId, {type: 'global'})
            message.channel.send(`Reloading global slash commands...`);
        } else {
            message.channel.send(`Invalid mode.`);
        }
    },
    cooldown: 10,
    aliases: [""],
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers], // to test
};

export default command;
