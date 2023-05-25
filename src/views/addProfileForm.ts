import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

const addProfileForm = new ModalBuilder()
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

addProfileForm.addComponents(row1, row2);

export default addProfileForm;