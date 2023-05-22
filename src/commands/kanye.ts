import { JSONType } from "@aws-sdk/client-s3";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import fetch from 'node-fetch';

type KanyeQuote = {
    quote: string;
}

@Discord()
export class SimSlash {
  @Slash({ description: "Random Kanye quote" })
  async kanye(
    interaction: CommandInteraction): Promise<void> {
        const response = await fetch('https://api.kanye.rest/', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        const result = (await response.json()) as KanyeQuote;
        interaction.reply(`${result.quote} - Kanye West`);
  }
}
