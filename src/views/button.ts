import { ActionRow, ActionRowBuilder, ActionRowData, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder, MessageActionRowComponentData, SlashCommandBuilder } from 'discord.js';

export const CompareButtons = () => {
	return new ActionRowBuilder<MessageActionRowComponentBuilder>()
		.addComponents(RunSimButton())
}

export const RunSimButton = () => {
	return new ButtonBuilder()
		.setLabel("Run Sim")
		.setCustomId('run-sim')
		.setStyle(ButtonStyle.Primary);
}