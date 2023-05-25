import { APIEmbedField, EmbedBuilder, User } from "discord.js";
import { GeneratorSegmentType, ResultType } from "../simc/formatter.js";
import { SimCItemData, SimCProfile } from "../simcprofile.js";
import { CompareProfile } from "../commands/compare.js";

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

export const ResultEmbed = (base: string, results: ResultType[], user: User) => {
	const baseline = results.find((result) => result.name === base);
	if (baseline) {
		const baselineDPS = baseline.dps;
	}

	const fields: APIEmbedField[] = results.map((result) => {
		let dpsDiff, dpsDiffPercent;
		if (baseline) {
			dpsDiff = result.dps - baseline.dps;
			dpsDiffPercent = (dpsDiff / baseline.dps) * 100;
			dpsDiffPercent -= 1;
		}

		let resultValue = `${result.dps} DPS`;
		if (dpsDiff && dpsDiffPercent) {
			const sign = dpsDiff > 0 ? "+" : "";
			const emote = dpsDiff > 0 ? ":chart_with_upwards_trend:" : ":chart_with_downwards_trend:"
			resultValue += `(**${sign}${dpsDiff.toFixed()}** ${emote})`
		}

		return {
			name: result.name,
			value: resultValue,
			inline: true,
		};
	});

	return new EmbedBuilder()
		.setTitle(`Simulation`)
		.setDescription(`Results for ${user.tag}`)
		.setFields(fields);
};


function formatItemToField(item: SimCItemData) {
	const enchantString = item.enchant ? `\n:sparkles: ${item.enchant.name}` : "";
	const gemsString = item.gems ? `\n:gem: ${item.gems?.map((gem) => gem.name).join("/")}` : "";
	const itemString = `**${item.name ?? "Nameless item"}**` + item.ilvl ? `(${item.ilvl})` : "";

	return `**${itemString}**${enchantString}${gemsString}`;
}

export const CompareMenu = async (cmp: CompareProfile) => {
	const capitalize = (str: string) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	const fields: APIEmbedField[] = cmp.copies.map((copy) => {
		return {
			name: copy.name,
			value: copy.items
				.map((item) => `${formatItemToField(item)}`)
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
		.addFields(fields);
};
