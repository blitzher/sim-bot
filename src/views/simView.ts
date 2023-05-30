import { ButtonInteraction, CommandInteraction, InteractionResponse } from "discord.js";
import { Formatter, FormatType } from "../simc/formatter.js";
import { Sim } from "../simc/sim.js";
import { SimCProfile } from "../simcprofile.js";
import { GeneratorEmbed, ResultEmbed } from "./embeds.js";
import config from "../config.json" assert {type: "json"}

type SimViewOptions = Partial<{
	oldReply: InteractionResponse<boolean>;
}>;

export async function simWithView(profile: SimCProfile | string, interaction: CommandInteraction | ButtonInteraction, options: SimViewOptions = {}) {
	let reply = options?.oldReply || await interaction.reply("Starting simulation...");
	const simId = interaction.user.id;

	const parsedProfile = (profile instanceof SimCProfile) ? profile : new SimCProfile(profile);
	const simString = (profile instanceof SimCProfile) ? profile.fullstring : profile;
	const process = Sim(simString, simId);
	const formatter = new Formatter(simId);

	process.stdout.on('data', (data: Buffer) => {
		formatter.feed(data.toString());
	});
	process.stderr.on('data', (err) => {
		console.log(`stderr-data: ${err}`);
	})

	let lastUpdate = 0;
	formatter.on(FormatType.GeneratorProgress, (progress) => {
		const now = Date.now();
		const dt = now - lastUpdate;
		if (dt > config.CONSTANTS.GENERATOR_MSG_MIN_DELAY) {
			reply.edit({
				embeds: [GeneratorEmbed(progress, interaction.user)]
			});
			lastUpdate = now;
		}
	});


	/* read the basename from the parsed profile, but make sure to not overwrite the input argument,
	 * as for comparisons and such, it is important that the caller can add duplicate keys to the argument */
	const baseName = parsedProfile.name;
	formatter.on(FormatType.Result, (result) => {
		reply.edit({
			embeds: [ResultEmbed(baseName, result, interaction.user)]
		});
	});
}