import { APIEmbedField, EmbedBuilder, User } from "discord.js";
import { GeneratorSegmentType, ResultType } from "../simc/formatter";

export const GeneratorEmbed = (segment: GeneratorSegmentType, user: User) => {
	const fillChar = "█"
	const emptyChar = "."
	const barWidth = 50;

	const percent = Math.min(segment.progress / segment.total, 1);
	const fillCount = Math.ceil(barWidth * percent);

	const bar = `[${fillChar.repeat(fillCount)}${emptyChar.repeat(barWidth - fillCount)}]`

	return new EmbedBuilder()
		.setTitle("Generating baseline...")
		.setDescription(`${segment.name}\n\`${bar}\``)
}

export const ResultEmbed = (results: ResultType[], user: User) => {

	const fields: APIEmbedField[] = results.map((result) => {
		return {
			name: result.name,
			value: `${result.dps} DPS`,
			inline: true
		}
	});

	return new EmbedBuilder()
		.setTitle(`Simulation`)
		.setDescription(`Results for ${user.tag}`)
		.setFields(fields)
}

export const CompareMenu = () => {
	return new EmbedBuilder();
}