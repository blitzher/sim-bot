import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { Client } from "discordx";

import { DogWoWClient } from "./wow-client/index.js";

import config from "./config.json" assert {type: "json"};
import * as simcprofile from "./simcprofile.js"
import * as data from "./data/manager.js";

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [

  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

bot.once("ready", async () => {
  // Make sure all guilds are cached
  // await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  bot.executeCommand(message);
});

async function initialiseDiscordClient() {
  const tokenToUse: "BOT_TOKEN" | "TEST_BOT_TOKEN" = <any>config.LOCAL.TOKEN_TO_USE;
  const token = config.TOKENS[tokenToUse];
  if (!token) throw Error("Missing discord token.");
  await bot.login(token);

  console.log('Discord client succesful initialised');
}

async function initialise() {
  await DogWoWClient.getInstance().initialise();
  await initialiseDiscordClient();
  await data.initialise();
}

async function run() {
  // The following syntax should be used in the commonjs environment
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment


  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  await initialise();

}

run();
