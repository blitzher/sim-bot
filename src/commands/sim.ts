import { ActionRowBuilder, CommandInteraction, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { Discord, SelectMenuComponent, Slash } from "discordx";
import { S3Uploader } from "../aws/s3Uploader.js";
import * as utilities from "../utilities.js";
import { simWithView } from "../views/simView.js";

@Discord()
export class SimSlash {
  @Slash({ description: "Simulate the DPS of a selected profile", name: "sim" })
  async sim(
    interaction: CommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const s3Uploader = new S3Uploader();
      const profilesList = await s3Uploader.listObjectsInFolder(interaction.user.id, 'cal-dev-raiderprofiles');

      let profiles = [];

      if (!profilesList) throw (utilities.ErrorReplies.PROFILE_LIST_ERROR);

      for (let profile of profilesList) {
        if (profile) profiles.push({ label: profile, value: profile });
      }

      const profileMenu = new StringSelectMenuBuilder()
        .addOptions(profiles)
        .setCustomId('profile-menu');

      const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        profileMenu
      );

      interaction.editReply({
        components: [buttonRow],
        content: "Select profile to sim",
      });

      return;

    }
    catch (err) {
      utilities.defaultErrorHandle(interaction, err);
    }
  }

  @SelectMenuComponent({ id: "profile-menu" })
  async runSimWithSelectedProfile(interaction: StringSelectMenuInteraction): Promise<unknown> {
    try {
      await interaction.deferReply();

      const profileName = interaction.values[0];

      const profile = await utilities.getSimProfileFromS3(interaction.user.id, profileName);
      if (!profile) throw();
      await simWithView(profile, interaction);

      return;
    }
    catch (err) {
      utilities.defaultErrorHandle(interaction, err);
    }
  }

}