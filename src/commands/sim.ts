import { ApplicationCommandOption, ApplicationCommandOptionType, CommandInteraction, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import * as utilities from "../utilities.js";
import { simWithView } from "../views/simView.js";
import { S3Uploader } from "../aws/s3Uploader.js";

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
    @SlashOption({
      description: "Tag of the user to look for profile",
      name: "user",
      required: false,
      type: ApplicationCommandOptionType.User
    })
    user: User,
    interaction: CommandInteraction): Promise<void> {
    try {
      const userId = user ? user.id : interaction.user.id;
      const profile = await utilities.resolveSimulationProfile(userId, argument);
      await simWithView(profile, interaction);
    }
    catch (err) {
      utilities.defaultErrorHandle(interaction, err);
    }
  }
}

