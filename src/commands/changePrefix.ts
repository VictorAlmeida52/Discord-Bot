// noinspection JSUnusedGlobalSymbols

import { setGuildOption } from "../functions";
import { Command } from "../types";

const command: Command = {
    name: "changePrefix",
    execute: async (message, args) => {
        let prefix = args[1]
        if (!prefix) return message.channel.send("No prefix provided")
        if (!message.guild) return;
        await setGuildOption(message.guild, "prefix", prefix)
        message.channel.send("Prefix successfully changed!")
    },
    permissions: ["Administrator"],
    aliases: []
}

export default command