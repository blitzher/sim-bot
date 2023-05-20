import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { wow } from "blizzard.js";
import config from "./config.json" assert {type: "json"};

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

async function initialiseWoWClient() {
  const wowClient = await wow.createInstance({
    key: config.wowClientId,
    secret: config.wowClientSecret,
    origin: 'eu',
    locale: 'en_GB'
  });

  console.log('WoW client succesful initialised');
}

async function initialiseDiscordClient() {
  if (!config.token) throw Error("Missing discord token.");
  await bot.login(config.token);

  console.log('Discord client succesful initialised');
}

async function initialise() {
  await initialiseDiscordClient();
  await initialiseWoWClient();
}

async function run() {
  // The following syntax should be used in the commonjs environment
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  await initialise();

}

run();
