import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Sim } from "../simc/sim.ts";
import { writeFileSync } from "fs";
import { Formatter, FormatType } from "../simc/formatter.ts";
import { GeneratorEmbed, ResultEmbed } from "../simc/embeds.ts";


@Discord()
export class Slashes {
  @Slash({ description: "Sim an arbitrary string" })
  async sim(
    @SlashOption({
      description: "The string to sim",
      name: "string",
      required: true,
      type: ApplicationCommandOptionType.String
    })
    argument: string,
    interaction: CommandInteraction): Promise<void> {
    /* Regex to find all key-value pairs in input argument */
    const re = /(# )?[\w.]+=(".+?"|[^ ]+)/g
    const matches = argument.match(re);

    /* Filter out comments */
    const filtered = matches?.filter((m) => !m.startsWith("#"))
    const simString = filtered?.join("\n") || "";

    const reply = await interaction.reply("Starting simulation...");
    const simId = `${interaction.user.id}_${interaction.createdTimestamp}`

    const process = Sim(simString, simId);
    const formatter = new Formatter(simId);

    /* Feed data from sim process into formatter */
    process.stdout.on('data', (data: Buffer) => {
      formatter.feed(data.toString());
    })
    process.on("close", () => console.log("closed"));

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
}