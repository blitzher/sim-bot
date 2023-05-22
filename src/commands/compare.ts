import { ActionRow, ApplicationCommandOptionType, CommandInteraction, MessageComponentInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import * as utilities from "../utilities.js";
import * as Embeds from "../views/embeds.js";

@Discord()
export class Comparator {
	@Slash({ description: "Start an item comparison", name: "compare" })
	async compare(
		@SlashOption({
			name: "profile-name",
			type: ApplicationCommandOptionType.String,
			required: true,
			description: "The name of of the profile"
		})
		profileName: string,
		interaction: CommandInteraction): Promise<void> {
		try {
			const profile = utilities.getUserProfile(interaction.user.id, profileName);
			if (!profile) {
				interaction.reply(utilities.ErrorReplies.PROFILE_NOT_FOUND(profileName))
				return
			}
			interaction.reply({ embeds: [Embeds.CompareMenu()], components: [] })
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
