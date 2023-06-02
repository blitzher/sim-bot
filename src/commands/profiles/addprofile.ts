import { ApplicationCommandOptionType, CommandInteraction, ModalSubmitInteraction } from "discord.js";
import { Discord, Slash, SlashOption, ModalComponent } from "discordx";
import * as utilities from "../../utilities.js";
import AddProfileForm from '../../views/addProfileForm.js'; import { SimCProfile } from "../../simcprofile.js";
import { S3Uploader } from "../../aws/s3Uploader.js";

@Discord()
export class AddProfileCommand {
    @Slash({ description: "Save a profile for quick simmings", name: "addprofile" })
    async addProfile(interaction: CommandInteraction): Promise<void> {
        interaction.showModal(AddProfileForm("AddProfileModal", "Add new simulation profile"));
    }

    @ModalComponent()
    async AddProfileModal(interaction: ModalSubmitInteraction): Promise<void> {
        const [profileName, simcString] = ["profileNameInput", "rawSimcInput"].map((id) =>
            interaction.fields.getTextInputValue(id)
        );

        await interaction.deferReply();
        try {
            await this.AttemptPutProfile(simcString, profileName, interaction);
        }
        catch (err) {
            interaction.editReply(utilities.ErrorReplies.ERROR_UNKNOWN);
            console.log(err); //Log it so devs can see. Need to change this when actual logger is introduced
        }
    }

    async AttemptPutProfile(simcString: string, profileName: string, interaction: ModalSubmitInteraction) {

        if(!utilities.minimizeSimcProfile(simcString))
        {
            await interaction.editReply(utilities.ErrorReplies.PROFILE_INVALID);
            return
        }

        const s3Client = new S3Uploader();
        if (await s3Client.objectExists(interaction.user.id + '/' + profileName, 'cal-dev-raiderprofiles'))
        {
            interaction.editReply(utilities.ErrorReplies.PROFILE_ALREADY_EXISTS(profileName));
            return;
        }

        await s3Client.putObject(interaction.user.id + '/' + profileName, simcString, 'cal-dev-raiderprofiles');
        interaction.editReply(`Succesfully created profile \`${profileName}\``);
        return;
    }
}
