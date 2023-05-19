import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import * as utilities from "../utilities.js";
import * as fs from "fs"
import * as path from "path";

@Discord()
export class Profiles {
	@Slash({ description: "Save a profile for quick simming", name: "addprofile" })
	async addProfile(
		@SlashOption({
			name: "profile",
			type: ApplicationCommandOptionType.String,
			required: true,
			description: "The profile from the simc addon. Ensure you use the *nb* argument, i.e. use /simc nb"
		})
		profile: string,
		@SlashOption({
			name: "profile-name",
			type: ApplicationCommandOptionType.String,
			required: true,
			description: "The name of of the profile"
		})
		profileName: string,
		interaction: CommandInteraction): Promise<void> {

		const profileDirectory = utilities.getUserProfilesDirectory(interaction.user.id);
		const profilePath = path.join(profileDirectory, profileName);

		if (fs.existsSync(profilePath)) {
			await interaction.reply(utilities.ErrorReplies.EXISTING_PROFILE);
			return;
		}

		const minimizedProfile = utilities.minimizeSimcProfile(profile);

		if (!minimizedProfile) {
			await interaction.reply(utilities.ErrorReplies.INVALID_PROFILE)
			return;
		}

		fs.writeFile(profilePath, minimizedProfile, null, () => {
			interaction.reply(`Succesfully created profile \`${profileName}\``)
		})

	}

	@Slash({ description: "Update an existing profile", name: "updateprofile" })
	async updateProfile(
		@SlashOption({
			name: "profile",
			type: ApplicationCommandOptionType.String,
			required: true,
			description: "The profile from the simc addon. Ensure you use the *nb* argument, i.e. use /simc nb"
		})
		profile: string,
		@SlashOption({
			name: "profile-name",
			type: ApplicationCommandOptionType.String,
			required: true,
			description: "The name of of the profile"
		})
		profileName: string,
		interaction: CommandInteraction): Promise<void> {

		const profileDirectory = utilities.getUserProfilesDirectory(interaction.user.id);
		const profilePath = path.join(profileDirectory, profileName);

		if (!fs.existsSync(profilePath)) {
			await interaction.reply(utilities.ErrorReplies.NON_EXISTING_PROFILE);
			return;
		}

		const minimizedProfile = utilities.minimizeSimcProfile(profile);

		if (!minimizedProfile) {
			await interaction.reply(utilities.ErrorReplies.INVALID_PROFILE)
			return;
		}

		fs.writeFile(profilePath, minimizedProfile, null, () => {
			interaction.reply(`Succesfully created profile ${profileName}`)
		})

	}
}
