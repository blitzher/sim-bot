import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';

export const CompareButtons = () => {
	return new ActionRowBuilder()
		.addComponents(SearchItemButton(), RunSimButton())
}

export const SearchItemButton = () => {
	return new ButtonBuilder();
}

export const RunSimButton = () => {
	return new ButtonBuilder();
}