import { ApplicationCommandOptionType, CommandInteraction, InteractionResponse } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Sim } from "../simc/sim.js";
import { Formatter, FormatType } from "../simc/formatter.js";
import { GeneratorEmbed, ResultEmbed } from "../views/embeds.js";
import * as utilities from "../utilities.js";
import config from "../config.json" assert { type: "json" };


@Discord()
export class SimSlash {
  private currentProfile: string;

  private isProfile(simId: string, simArgument: string): boolean {
    try {
      this.currentProfile = utilities.resolveSimulationProfile(simId, simArgument);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  private isSimCString(simArgument: string): boolean {
    const simCItemRegex = '/(?<name>\w*)?,id=(?<id>\d+)(,enchant_id=(?<enchant_id>\d+))?(,gem_id=(?<gem_id>[\d\/]+))?(,bonus_id=(?<bonus_id>[\d\/]+))?(,crafted_stats=(?<crafted_stats>[\d\/]+))?(,crafting_quality=(?<crafted_quality>\d+))?/gm';
    return simArgument.match(simCItemRegex) !== null;
  }

  @Slash({ description: "Sim an arbitrary string" })
  async sim(
    @SlashOption({
      description: "The string to sim or the name of a profile",
      name: "string",
      required: true,
      type: ApplicationCommandOptionType.String
    })
    simArgument: string,
    interaction: CommandInteraction): Promise<void> {
    try {
      let process;
      const simId = interaction.user.id;

      if (this.isProfile(simId, simArgument)) {
        process = Sim(this.currentProfile, simId)
      }
      else if (this.isSimCString(simArgument)) {
        process = Sim(simArgument, simId);
      }
      else {
        throw (new utilities.UserError(utilities.ErrorReplies.INVALID_SIM_ARGUMENT));
      }

      const reply = await interaction.reply("Starting simulation...");
      process = Sim(simArgument, simId);

      this.displayResultsToUser(simId, interaction, reply);
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

  private displayResultsToUser(simId: string, interaction: CommandInteraction, reply: InteractionResponse): void {
    const formatter = new Formatter(simId);

    process.stdout.on('data', (data: Buffer) => {
      formatter.feed(data.toString());
    })

    this.showProgress(formatter, interaction, reply);

    formatter.on(FormatType.Result, (result) => {
      reply.edit({
        embeds: [ResultEmbed(result, interaction.user)]
      })
    })

  }

  private showProgress(formatter: Formatter, interaction: CommandInteraction, reply: InteractionResponse): void {
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
  }
}
