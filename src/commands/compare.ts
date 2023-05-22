import {
	ActionRow,
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	InteractionResponse,
	MessageComponentInteraction,
	User,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import * as utilities from "../utilities.js";
import * as Embeds from "../views/embeds.js";
import { CompareButtons } from "../views/button.js";
import { SimCItem, SimCItemData, SimCProfile } from "../simcprofile.js";
import { EventEmitter } from "events";
import { Sim } from "../simc/sim.js";
import { simWithView } from "../views/simView.js";

/* Temporary quick-implementation of state */
export type CompareProfile = {
	profile: SimCProfile;
	active: boolean;
	copies: {
		name: string;
		items: SimCItemData[];
	}[];
	emitter: EventEmitter;
	interaction: CommandInteraction;
	reply?: InteractionResponse<boolean>;
};
const UsersRunningCompares: { [key: string]: undefined | CompareProfile } = {};

@Discord()
export class Comparator {
	@ButtonComponent({ id: "run-sim" })
	async runSimHandler(interaction: ButtonInteraction) {
		const comparison = UsersRunningCompares[interaction.user.id];
		if (!comparison) {
			interaction.reply(utilities.ErrorReplies.COMPARATOR_NOT_RUNNING);
			return;
		}

		let simString = comparison.profile.fullstring;

		for (let copy of comparison.copies) {
			simString += `\ncopy="${copy.name},${comparison.profile.name}"`;
			for (let item of copy.items) {
				simString += `\n${SimCItem.fullstring(item)}`;
			}
		}

		const reply = await interaction.reply("Starting comparison...");
		simWithView(simString, interaction, reply);
	}

	@Slash({ description: "Add items to comparison.", name: "additem" })
	async addItem(
		@SlashOption({
			name: "item-name",
			type: ApplicationCommandOptionType.String,
			required: true,
			description: "A string of zero length is not allowed",
		})
		itemName: string,
		@SlashOption({
			name: "item-level",
			type: ApplicationCommandOptionType.Number,
			required: true,
			description: "The item level",
		})
		itemLevel: number,
		@SlashOption({
			name: "gems",
			type: ApplicationCommandOptionType.String,
			required: false,
			description: "Gems. Use `/` to enter multiple gems",
		})
		gems: string,
		@SlashOption({
			name: "enchant",
			type: ApplicationCommandOptionType.String,
			required: false,
			description: "Enchantment on the item",
		})
		enchant: string,
		interaction: CommandInteraction,
	): Promise<void> {
		const comparison = UsersRunningCompares[interaction.user.id];
		if (!comparison) {
			interaction.reply(utilities.ErrorReplies.COMPARATOR_NOT_RUNNING);
			return;
		}

		// Search for item

		comparison.copies.push({
			name: "onyx_impostors_birthright",
			items: [
				{
					slot: "finger1",
					id: 204398,
					bonus_id: [6652, 7981, 1498, 8767, 8780],
					gem_id: [192919],
					enchant_id: 6550,
					ilvl: 100,
				},
			],
		});

		interaction.reply({
			content: `Added onyx_impostors_birthright to comparison.`,
			ephemeral: true,
		});
		comparison.emitter.emit("update", comparison);
	}

	@Slash({ description: "Start an item comparison", name: "compare" })
	async compare(
		@SlashOption({
			name: "profile-name",
			type: ApplicationCommandOptionType.String,
			required: true,
			description: "The name of of the profile",
		})
		profileName: string,
		@SlashOption({
			description: "Tag of the user to look for profile",
			name: "user",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: User,
		interaction: CommandInteraction,
	): Promise<void> {
		try {
			const userId = user ? user.id : interaction.user.id;
			const profile = utilities.resolveSimulationProfile(
				userId,
				profileName,
			);
			const buttons = CompareButtons();

			const emitter = new EventEmitter();
			const comparison: CompareProfile = {
				profile,
				active: true,
				copies: [],
				emitter,
				interaction,
			};
			UsersRunningCompares[interaction.user.id] = comparison;

			const reply = await interaction.reply({
				embeds: [Embeds.CompareMenu(comparison)],
				components: [buttons],
			});

			comparison.reply = reply;

			emitter.on("update", (comparison: CompareProfile) => {
				interaction.editReply({
					embeds: [Embeds.CompareMenu(comparison)],
					components: [buttons],
				});
			});
		} catch (err) {
			utilities.defaultErrorHandle(interaction, err);
		}
	}
}
