
type ItemId = number;
type GemId = number;
type EnchantId = number;

export declare module WoWApi {
	type WoWItem = {
		name: string
		id: ItemId;
		slot: string;
		ilvl: number;
		gems?: GemId[];
		enchant?: EnchantId
	}

	function getItem(name: string): WoWItem[];
	function getEnchant(name: string): EnchantId;
	function getGem(name: string): GemId;
}