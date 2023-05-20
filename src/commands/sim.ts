import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Sim } from "../simc/sim.js";
import { writeFileSync } from "fs";
import { Formatter, FormatType } from "../simc/formatter.js";
import { GeneratorEmbed, ResultEmbed } from "../views/embeds.js";
import * as utilities from "../utilities.js";
import config from "../config.json" assert { type: "json" };


@Discord()
export class SimSlash {
  @Slash({ description: "Sim an arbitrary string" })
  async sim(
    @SlashOption({
      description: "The string to sim or the name of a profile",
      name: "string",
      required: true,
      type: ApplicationCommandOptionType.String
    })
    argument: string,
    interaction: CommandInteraction): Promise<void> {
    try {
      const profile = utilities.resolveSimulationProfile(interaction.user.id, argument);

      /* Let user known that the sim is starting */
      const reply = await interaction.reply("Starting simulation...");
      const simId = interaction.user.id;

      /* Start child process and create a new formatter for reading output from simc stdout stream */
      const process = Sim(profile, simId);
      const formatter = new Formatter(simId);

      process.stdout.on('data', (data: Buffer) => {
        formatter.feed(data.toString());
      })

      /* Ensure that formatter is not spamming discord API with  */
      let lastUpdate = Date.now();
      formatter.on(FormatType.GeneratorProgress, (progress) => {
        const now = Date.now();
        const dt = now - lastUpdate;
        if (dt > config.CONSTANTS.GENERATOR_MSG_MIN_DELAY) {
          reply.edit({
            embeds: [GeneratorEmbed(progress, interaction.user)]
          })
          lastUpdate = now;
        }
      })

      /*  */
      formatter.on(FormatType.Result, (result) => {
        reply.edit({
          embeds: [ResultEmbed(result, interaction.user)]
        })
      })
    }
    catch (err) {
      if (err instanceof utilities.UserError) {
        interaction.reply(err.message);
      }
      else {
        interaction.reply(utilities.ErrorReplies.ERROR_UNKNOWN)
        console.log(err);
      }
    }
  }
}
