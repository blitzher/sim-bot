import { ButtonInteraction, CommandInteraction, InteractionResponse } from "discord.js";
import { Formatter, FormatType } from "../simc/formatter.js";
import { Sim } from "../simc/sim.js";
import { SimCProfile } from "../simcprofile.js";
import { GeneratorEmbed, ResultEmbed } from "./embeds.js";
import config from "../config.json" assert {type: "json"}

export async function simWithView(profile: SimCProfile | string, interaction: CommandInteraction | ButtonInteraction, oldReply?: InteractionResponse<boolean>) {
	/* Let user known that the sim is starting */

	let reply = oldReply || await interaction.reply("Starting simulation...");
	const simId = interaction.user.id;

	/* Start child process and create a new formatter for reading output from simc stdout stream */
	const simString = (profile instanceof SimCProfile) ? profile.fullstring : profile;
	const process = Sim(simString, simId);
	const formatter = new Formatter(simId);

	process.stdout.on('data', (data: Buffer) => {
		formatter.feed(data.toString());
	});
	process.stderr.on('data', (err) => {
		console.log(`stderr-data: ${err}`);
	})





	/* Ensure that formatter is not spamming discord API with  */
	let lastUpdate = Date.now();
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

	/*  */
	formatter.on(FormatType.Result, (result) => {
		reply.edit({
			embeds: [ResultEmbed(result, interaction.user)]
		});
	});
}