import { APIEmbedField, EmbedBuilder, User } from "discord.js";
import { GeneratorSegmentType, ResultType } from "../simc/formatter";
import { SimCProfile } from "../simcprofile";
import { CompareProfile } from "../commands/compare";

export const GeneratorEmbed = (segment: GeneratorSegmentType, user: User) => {
	const fillChar = "█";
	const emptyChar = ".";
	const barWidth = 50;

	const percent = Math.min(segment.progress / segment.total, 1);
	const fillCount = Math.ceil(barWidth * percent);

	const bar = `[${fillChar.repeat(fillCount)}${emptyChar.repeat(
		barWidth - fillCount,
	)}]`;

	return new EmbedBuilder()
		.setTitle("Generating baseline...")
		.setDescription(`${segment.name}\n\`${bar}\``);
};

export const ResultEmbed = (results: ResultType[], user: User) => {
	const fields: APIEmbedField[] = results.map((result) => {
		return {
			name: result.name,
			value: `${result.dps} DPS`,
			inline: true,
		};
	});

	return new EmbedBuilder()
		.setTitle(`Simulation`)
		.setDescription(`Results for ${user.tag}`)
		.setFields(fields);
};

export const CompareMenu = (cmp: CompareProfile) => {
	const capitalize = (str: string) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	const fields: APIEmbedField[] = cmp.copies.map((copy) => {
		return {
			name: copy.name,
			value: copy.items
				.map((item) => `${item.name || "Some item"} (${item.id})`)
				.join("\n"),
		};
	});

	return new EmbedBuilder()
		.setTitle(cmp.profile.name)
		.setDescription(
			`${capitalize(cmp.profile.spec)} ${capitalize(
				cmp.profile.class,
			)}\nTalents: \`${cmp.profile.talents}\``,
		)
		.setThumbnail(
			`http://skovboo.org:8081/class-icons/${cmp.profile.class}_round.png`,
		)
		.setImage(
			`https://www.raidbots.com/simbot/render/talents/${cmp.profile.talents}?width=300&mini=1&level=60&bgcolor=330000`,
		)
		.addFields(fields);
};
