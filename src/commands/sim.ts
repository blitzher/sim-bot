import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Sim } from "../simc/sim.js";
import { writeFileSync } from "fs";
import { Formatter, FormatType } from "../simc/formatter.js";
import { GeneratorEmbed, ResultEmbed } from "../views/embeds.js";
import * as utilities from "../utilities.js";


function resolveSimulationProfile(interaction: CommandInteraction, argument: string) {
  let profile = utilities.getUserProfile(interaction.user.id, argument);
  if (!profile) {
    profile = utilities.minimizeSimcProfile(argument)
    if (!profile) {
      interaction.reply(utilities.ErrorReplies.PROFILE_INVALID);
      throw (`Could not find profile: ${argument} for user: ${interaction.user.id}`);
    }
  }

  return profile;
}

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
      const profile = resolveSimulationProfile(interaction, argument);

      const reply = await interaction.reply("Starting simulation...");
      const simId = interaction.user.id;

      const process = Sim(profile, simId);
      const formatter = new Formatter(simId);

      /* Feed data from sim process into formatter */
      process.stdout.on('data', (data: Buffer) => {
        formatter.feed(data.toString());
      })

      let lastUpdate = Date.now();
      formatter.on(FormatType.GeneratorProgress, (progress) => {
        const now = Date.now();
        const dt = now - lastUpdate;
        if (dt > 1000) {
          reply.edit({
            embeds: [GeneratorEmbed(progress, interaction.user)]
          })
          lastUpdate = now;
        }
      })

      formatter.on(FormatType.Result, (result) => {
        reply.edit({
          embeds: [ResultEmbed(result, interaction.user)]
        })
      })
    }
    catch (err) {
      console.log(err);
    }
  }
}
