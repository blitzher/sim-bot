import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import * as utilities from "../utilities.js";
import * as fs from "fs"
import * as path from "path";
import { WoWApi } from "../wowapi/index.js";
import * as Embeds from "../views/embeds.js";

@Discord()
export class Comparator {
	@Slash({ description: "Save a profile for quick simming", name: "addprofile" })
	async compare(
		@SlashOption({
			name: "profile-name",
			type: ApplicationCommandOptionType.String,
			required: true,
			description: "The name of of the profile"
		})
		profileName: string,
		interaction: CommandInteraction): Promise<void> {

		const profile = utilities.getUserProfile(interaction.user.id, profileName);
		if (!profile) {
			interaction.reply(utilities.ErrorReplies.PROFILE_NOT_FOUND(profileName))
			return
		}

		interaction.reply({ embeds: [Embeds.CompareMenu()], })








	}
}
