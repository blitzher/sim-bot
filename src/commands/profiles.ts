import { ApplicationCommandOptionType, CommandInteraction, ModalSubmitInteraction } from "discord.js";
import { Discord, Slash, SlashOption, ModalComponent } from "discordx";
import * as utilities from "../utilities.js";
import * as fs from "fs"
import * as path from "path";
import AddProfileForm from '../views/addProfileForm.js'; import { SimCProfile } from "../simcprofile.js";

enum ExistStatus {
	MUST_EXIST,
	MUST_NOT_EXIST
}

@Discord()
export class Profiles {
	@Slash({ description: "Save a profile for quick simming", name: "addprofile" })
	async addProfile(interaction: CommandInteraction): Promise<void> {
		interaction.showModal(AddProfileForm("AddProfileModal"));
	}

	@ModalComponent()
	async AddProfileModal(interaction: ModalSubmitInteraction): Promise<void> {
		const [profileName, simcString] = ["profileNameInput", "rawSimcInput"].map((id) =>
			interaction.fields.getTextInputValue(id)
		);

		await this.AttemptWriteProfile(simcString, profileName, interaction, ExistStatus.MUST_NOT_EXIST)
	}

	@Slash({ description: "Update an existing profile", name: "updateprofile" })
	async updateProfile(interaction: CommandInteraction): Promise<void> {
		await interaction.showModal(AddProfileForm("UpdateProfileModal"));
	}
	@ModalComponent()
	async UpdateProfileModal(interaction: ModalSubmitInteraction): Promise<void> {
		const [profileName, simcString] = ["profileNameInput", "rawSimcInput"].map((id) =>
			interaction.fields.getTextInputValue(id)
		);

		await this.AttemptWriteProfile(simcString, profileName, interaction, ExistStatus.MUST_EXIST)
	}

	async AttemptWriteProfile(simString: string, profileName: string, interaction: ModalSubmitInteraction, existStatus: ExistStatus) {

		const profileDirectory = utilities.getUserProfilesDirectory(interaction.user.id);
		const profilePath = path.join(profileDirectory, profileName);

		const profileExists = fs.existsSync(profilePath);
		if (profileExists && existStatus === ExistStatus.MUST_NOT_EXIST) {
			await interaction.reply(utilities.ErrorReplies.PROFILE_ALREADY_EXISTS(profileName));
			return;
		} else if (!profileExists && existStatus === ExistStatus.MUST_EXIST) {
			await interaction.reply(utilities.ErrorReplies.PROFILE_NOT_FOUND(profileName));
			return;
		}

		const minimizedProfile = utilities.minimizeSimcProfile(simString);

		if (!minimizedProfile) {
			await interaction.reply(utilities.ErrorReplies.PROFILE_INVALID)
			return;
		}

		fs.writeFile(profilePath, minimizedProfile.fullstring, null, () => {
			interaction.reply(`Succesfully created profile \`${profileName}\``)
		})
	}
}
