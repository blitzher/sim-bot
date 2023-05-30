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
import { InventoryTypeToSimCSlot, queryEnchantment, queryGem, queryItem } from "../data/manager.js";

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
			simString += `\ncopy="${copy.name.replace(/\W/, "")},${comparison.profile.name}"`;
			for (let item of copy.items) {
				simString += `\n${SimCItem.fullstring(item)}`;
			}
		}

		const oldReply = await interaction.reply("Starting comparison...");
		simWithView(simString, interaction, { oldReply }).then(() => {
			delete UsersRunningCompares[interaction.user.id];
		});
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
		@SlashOption({
			name: "slot",
			type: ApplicationCommandOptionType.Number,
			required: false,
			description: "The slot of a finger or trinket",
			minValue: 1,
			maxValue: 2,
		})
		slot: number,
		interaction: CommandInteraction,
	): Promise<void> {
		const comparison = UsersRunningCompares[interaction.user.id];
		if (!comparison) {
			interaction.reply(utilities.ErrorReplies.COMPARATOR_NOT_RUNNING);
			return;
		}



		const queriedItems = queryItem(itemName);
		if (queriedItems.length === 0) {
			interaction.reply({
				content: `Item ${itemName} not found.`,
				ephemeral: true,
			});
			return;
		}
		/* For now, only select first item found */
		const item = queriedItems[0];
		let itemSlot = InventoryTypeToSimCSlot(item.inventoryType);
		if (!itemSlot) {
			interaction.reply({
				content: utilities.ErrorReplies.ITEM_INVALID(itemName),
				ephemeral: true
			});
			return;
		}
		if (["finger", "trinket"].includes(itemSlot) && !slot) {
			interaction.reply({
				content: utilities.ErrorReplies.ITEM_MISSING_SLOT(itemSlot),
				ephemeral: true,
			});
			return;
		}
		else if (["finger", "trinket"].includes(itemSlot) && slot) {
			itemSlot += slot;
		}

		const copy = {
			name: item.name + " " + slot ?? "",
			items: [
				{
					name: item.name,
					slot: itemSlot,
					id: item.id,
					bonus_id: item.bonusLists,
					ilvl: itemLevel,
				}
			] as SimCItemData[]
		};

		if (gems) {
			const gemNames = gems.split("/");
			const gemsFound: { id: number, name: string }[] = [];
			for (let gemName of gemNames) {
				const gem = queryGem(gemName, 3)[0];
				if (!gem) {
					interaction.reply({
						content: `Gem \`${gemName}\` not found.`,
						ephemeral: true,
					});
					return;
				}

				gemsFound.push({ id: gem.itemId, name: gem.itemName ?? gem.displayName });
			}
			copy.items[0].gems = gemsFound;
		}
		if (enchant) {
			const enchantments = queryEnchantment(enchant);
			if (enchantments.length === 0 || enchantments.length > 5) {
				interaction.reply({
					content: `Enchantment \`${enchant}\` not found.`,
					ephemeral: true,
				});
				return;
			}
			const enchantment = enchantments[0];
			copy.items[0].enchant = { id: enchantment.id, name: enchantment.displayName };
		}

		comparison.copies.push(copy);
		interaction.reply({
			content: `Added ${copy.name} to comparison.`,
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
			const profile = await utilities.resolveSimulationProfile(
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
				embeds: [await Embeds.CompareMenu(comparison)],
				components: [buttons],
			});

			comparison.reply = reply;

			emitter.on("update", async (comparison: CompareProfile) => {
				interaction.editReply({
					embeds: [await Embeds.CompareMenu(comparison)],
					components: [buttons],
				});
			});
		} catch (err) {
			utilities.defaultErrorHandle(interaction, err);
		}
	}
}
