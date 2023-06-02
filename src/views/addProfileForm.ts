import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

const addProfileForm = (id: string, title: string) =>
	new ModalBuilder()
		.setTitle(title)
		.setCustomId(id)
		.addComponents(row1(), row2());

const profileNameInputComponent = () => new TextInputBuilder()
	.setCustomId("profileNameInput")
	.setLabel("Profile name")
	.setPlaceholder("Enter simulation profile name. eg, raid")
	.setStyle(TextInputStyle.Short);

const rawSimcInputComponent = () => new TextInputBuilder()
	.setCustomId("rawSimcInput")
	.setLabel("SimC profile")
	.setPlaceholder("Paste your /simc nb string here")
	.setStyle(TextInputStyle.Paragraph);

const row1 = () => new ActionRowBuilder<TextInputBuilder>().addComponents(
	profileNameInputComponent()
);

const row2 = () => new ActionRowBuilder<TextInputBuilder>().addComponents(
	rawSimcInputComponent()
);

export default addProfileForm;