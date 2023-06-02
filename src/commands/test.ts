import { CommandInteraction, ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

import { DynamoUploader } from "../aws/dynamoUploader.js";
import { S3Uploader } from "../aws/s3Uploader.js";
import { Raider } from "../raider/raider.js";
import { readdir } from "fs/promises";
import path from "path";
import fs from 'fs';

@Discord()
export class SimSlash {
  @Slash({ description: "Test put to dynamo", name: "putdynamo" })
  async testPut(
    @SlashOption({
      description: "The string to sim or the name of a profile",
      name: "string",
      required: true,
      type: ApplicationCommandOptionType.String
    })
    simcstring: string,
    interaction: CommandInteraction): Promise<void> {

    const reply = await interaction.reply("Getting all players with profiles...");

    const profileDirectory = "C:\\Users\\Cal\\Documents\\git\\sim-bot\\prod-profiles";
    const dirs = await readdir(profileDirectory, { withFileTypes: true });
    const playersWithProfile = dirs.filter(directory => directory.isDirectory()).map(directory => directory.name);

    const dynamoUploader = new DynamoUploader('dev-cal-raiders');
    const s3Uploader = new S3Uploader();

    let playersString = '';
    let playersToUpload = [];
    for (let player of playersWithProfile) {
      const playerString = await interaction.guild?.members.fetch(player);

      let raider;
      if (playerString?.displayName) {
        raider = new Raider(playerString.displayName, player, 'unknown');

        const simcProfiles = fs.readdirSync(path.join(profileDirectory, player));
        for (let simcProfile of simcProfiles) {
          raider.addProfile(simcProfile);
          const simCBlob = fs.readFileSync(profileDirectory + "\\" + player + "\\" + simcProfile);
          const s3Response = await s3Uploader.putObject(player + "/" + simcProfile, simCBlob, 'cal-dev-raiderprofiles');
        }
        await dynamoUploader.putObjectDynamo(raider);
      }

      interaction.editReply("Uploaded player info to database");
    }
  }
}