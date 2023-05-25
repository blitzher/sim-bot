import { ApplicationCommandOptionType, CommandInteraction, ModalSubmitInteraction, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Discord, Slash, SlashOption, ModalComponent } from "discordx";
import * as utilities from "../utilities.js";
import * as fs from "fs"
import * as path from "path";

@Discord()
export class Profiles {
	@Slash({ description: "Save a profile for quick simming", name: "addprofile" })
	async addProfile(
		interaction: CommandInteraction): Promise<void> {

		const modal = new ModalBuilder()
			.setTitle("Add new simulation profile")
			.setCustomId("SimProfileModal");

		const profileNameInputComponent = new TextInputBuilder()
			.setCustomId("profileNameInput")
			.setLabel("Enter simulation profile name. eg, raid")
			.setStyle(TextInputStyle.Short);

		const rawSimcInputComponent = new TextInputBuilder()
			.setCustomId("rawSimcInput")
			.setLabel("Enter /simc nb string")
			.setStyle(TextInputStyle.Paragraph);

		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
			profileNameInputComponent
		);

		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
			rawSimcInputComponent
		);

		modal.addComponents(row1, row2);

		interaction.showModal(modal);
	}

	@ModalComponent()
	async SimProfileModal(interaction: ModalSubmitInteraction): Promise<void> {
		const [profileName, simcString] = ["profileNameInput", "rawSimcInput"].map((id) =>
			interaction.fields.getTextInputValue(id)
		);

		const profileDirectory = utilities.getUserProfilesDirectory(interaction.user.id);
		const profilePath = path.join(profileDirectory, profileName);

		if (fs.existsSync(profilePath)) {
			await interaction.reply(utilities.ErrorReplies.PROFILE_ALREADY_EXISTS);
			return;
		}

		const minimizedProfile = utilities.minimizeSimcProfile(simcString);

		if (!minimizedProfile) {
			await interaction.reply(utilities.ErrorReplies.PROFILE_INVALID)
			return;
		}

		fs.writeFile(profilePath, minimizedProfile, null, () => {
			interaction.reply(`Succesfully created profile \`${profileName}\``)
		})

		return;
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
			await interaction.reply(utilities.ErrorReplies.PROFILE_NOT_FOUND(profileName));
			return;
		}

		const minimizedProfile = utilities.minimizeSimcProfile(profile);

		if (!minimizedProfile) {
			await interaction.reply(utilities.ErrorReplies.PROFILE_INVALID)
			return;
		}

		fs.writeFile(profilePath, minimizedProfile, null, () => {
			interaction.reply(`Succesfully created profile ${profileName}`)
		})

	}
}
