import {
  Client,
  GatewayIntentBits,
  Collection,
  PermissionFlagsBits,
} from "discord.js";
const {
  Guilds,
  MessageContent,
  GuildMessages,
  GuildMembers,
  GuildVoiceStates,
} = GatewayIntentBits;
const client = new Client({
  intents: [
    Guilds,
    MessageContent,
    GuildMessages,
    GuildMembers,
    GuildVoiceStates,
  ],
});
import {Command, ContextMenuCommand, SlashCommand} from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
import { DisTube } from "distube";
import { SpotifyPlugin } from "@distube/spotify";
import { SoundCloudPlugin } from "@distube/soundcloud";
config();

client.slashCommands = new Collection<string, SlashCommand>();
client.contextMenuCommands = new Collection<string, ContextMenuCommand>();
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, number>();
client.distube = new DisTube(client, {
  leaveOnStop: false,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: true,
  emitAddListWhenCreatingQueue: true,
  plugins: [
    new SpotifyPlugin({
      parallel: true,
      emitEventsAfterFetching: false,
    }),
    new SoundCloudPlugin(),
  ],
});

const handlersDir = join(__dirname, "./handlers");
readdirSync(handlersDir).forEach((handler) => {
  require(`${handlersDir}/${handler}`)(client);
});


client.login(process.env.TOKEN).then();
