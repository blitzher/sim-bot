type ItemId = number;
type GemId = number;
type EnchantId = number;

type WoWItem = {
    name: string;
    id: ItemId;
    slot: string;
    ilvl: number;
    gems?: GemId[];
    enchant?: EnchantId
}

export default WoWItem;