import {Client, ContextMenuCommandBuilder, Routes} from "discord.js";
import {REST} from "@discordjs/rest";
import {readdirSync} from "fs";
import {join} from "path";
import {color} from "../functions";
import {ContextMenuCommand} from "../types";

module.exports = (client: Client) => {
    const contextMenuCommands: ContextMenuCommandBuilder[] = [];

    let contextMenuCommandsDir = join(__dirname, "../contextMenuCommands");

    readdirSync(contextMenuCommandsDir).forEach((file) => {
        if (!file.endsWith(".js")) return;
        let command: ContextMenuCommand = require(`${contextMenuCommandsDir}/${file}`).default;
        contextMenuCommands.push(command.command);
        client.contextMenuCommands.set(command.command.name, command);
    });

    const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

    rest
        .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEFAULT_GUILD), {
            body: contextMenuCommands.map((command) => command.toJSON()),
        })
        .then((data: any) => {
            console.log(
                color(
                    "text",
                    `🔥 Successfully loaded ${color(
                        "variable",
                        data.length
                    )} context menu command(s)`
                )
            );
        })
        .catch((e) => {
            console.log(e);
        });
};
