// noinspection JSUnusedGlobalSymbols

import {
  SlashCommandBuilder,
  CommandInteraction,
  Collection,
  PermissionResolvable,
  Message,
  AutocompleteInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction,
} from "discord.js";
import { DisTube } from "distube";
import mongoose from "mongoose";

export interface SlashCommand {
  command: SlashCommandBuilder | any;
  execute: (interaction: CommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number; // in seconds
}

export interface ContextMenuCommand {
  command: ContextMenuCommandBuilder | any;
  execute: (interaction: ContextMenuCommandInteraction) => void;
}

export interface Command {
  name: string;
  execute: (message: Message, args: Array<string>) => void;
  permissions: Array<PermissionResolvable>;
  aliases: Array<string>;
  cooldown?: number;
}

interface GuildOptions {
  prefix: string;
}

export interface IGuild extends mongoose.Document {
  guildID: string;
  options: GuildOptions;
  joinedAt: Date;
}

export type GuildOption = keyof GuildOptions;
export interface BotEvent {
  name: string;
  once?: boolean | false;
  distube?: boolean | false;
  execute: (...args) => void;
}

declare global {
  namespace NodeJS {
    // noinspection JSUnusedGlobalSymbols
    interface ProcessEnv {
      TOKEN: string;
      CLIENT_ID: string;
      DEFAULT_GUILD: string;
      PREFIX: string;
      MONGO_URI: string;
      MONGO_DATABASE_NAME: string;
      COLOR_DEFAULT: string;
      COLOR_ERROR: string;
      OWNER_ID: string;
    }
  }
}

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    contextMenuCommands: Collection<string, ContextMenuCommand>;
    commands: Collection<string, Command>;
    cooldowns: Collection<string, number>;
    distube: DisTube;
  }
}

export interface CommandRegistrationOptions {
  type: string;
  guildId?: string;
}