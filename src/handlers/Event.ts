import { Client } from "discord.js";
import { DisTubeEvents } from "distube";
import { readdirSync } from "fs";
import { join } from "path";
import { color } from "../functions";
import { BotEvent } from "../types";

module.exports = (client: Client) => {
  let eventsDir = join(__dirname, "../events");

  readdirSync(eventsDir).forEach((file) => {
    if (!file.endsWith(".js")) return;
    let event: BotEvent = require(`${eventsDir}/${file}`).default;
    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : event.distube
      ? client.distube.on(event.name as keyof DisTubeEvents, (...args: any) =>
          event.execute(...args, client)
        )
      : client.on(event.name, (...args) => event.execute(...args));
    console.log(
      color(
        "text",
        `🌠 Successfully loaded event ${color("variable", event.name)}`
      )
    );
  });
};
