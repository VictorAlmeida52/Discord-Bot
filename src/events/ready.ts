// noinspection JSUnusedGlobalSymbols

import { Client } from "discord.js";
import { BotEvent } from "../types";
import { color } from "../functions";

const event : BotEvent = {
    name: "ready",
    once: true,
    execute: (client : Client) => {
        client.users.fetch(process.env.OWNER_ID).then(async (user) => {
            await user.send(`I am now online`);
        });
        console.log(
            color("text", `💪 Logged in as ${color("variable", client.user?.tag)}`)
        )
    }
}

export default event