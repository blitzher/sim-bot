import * as fs from "fs";
import * as path from "path";
import * as utilities from "../utilities.js";
import fetch from "node-fetch";

const MS_PER_DAY = 86400000; // 24 * 60 * 60 * 1000
const CACHE_DIRECTORY = utilities.getDirectory(utilities.LocalDirectories.DATA_CACHE);
const CACHE_META_FILEPATH = path.join(CACHE_DIRECTORY, ".meta.json");

enum CacheFileEnum {
	ENCHANTMENTS,
	EQUIPPABLE_ITEMS
}

enum InventoryType {
	NonEquip,
	Head,
	Neck,
	Shoulder,
	Shirt,
	Chest,
	Waist,
	Legs,
	Feet,
	Wrist,
	Hands,
	Finger,
	Trinket,
	OneHand,
	Shield,
	Ranged,
	Back,
	TwoHand,
	Bag,
	Tabard,
	Robe,
	MainHand,
	OffHand,
	HeldInOffHand,
	Ammo,
	Thrown,
	RangedRight,
	Quiver,
	Relic
}

export const InventoryTypeToSimCSlot = (type: InventoryType): string | void => {
	switch (type) {
		case InventoryType.Head:
			return "head";
		case InventoryType.Neck:
			return "neck";
		case InventoryType.Shoulder:
			return "shoulder";
		case InventoryType.Back:
			return "back";
		case InventoryType.Chest:
			return "chest";
		case InventoryType.Wrist:
			return "wrist";
		case InventoryType.Hands:
			return "hands";
		case InventoryType.Waist:
			return "waist";
		case InventoryType.Legs:
			return "legs";
		case InventoryType.Feet:
			return "feet";
		case InventoryType.Finger:
			return "finger";
		case InventoryType.Trinket:
			return "trinket";
		case InventoryType.OneHand:
			return "main_hand";
		case InventoryType.Shield:
			return "off_hand";
		case InventoryType.RangedRight:
			return "main_hand";
		case InventoryType.TwoHand:
			return "main_hand";

	}
}

const CachedFiles = {
	ENCHANTMENTS: {
		fileName: "enchantments.json",
		endpoint: "https://www.raidbots.com/static/data/live/enchantments.json",
		data: [] as EnchantmentType[],
	},
	EQUIPPABLE_ITEMS: {
		fileName: "equippable-items.json",
		endpoint: "https://www.raidbots.com/static/data/live/equippable-items.json",
		data: [] as ItemType[],
	}
}

type EnchantmentType = {
	id: number,
	baseDisplayName?: string,
	displayName: string,
	spellId: number,
	spellIcon: string,
	itemId: number,
	itemName?: string,
	quality?: number,
	tokenizedName: string,
	stats: {
		type: string,
		amount: number
	}[],
	equipRequirements: {
		itemClass: number,
		itemSubClassMask: number,
		invTypeMask: number
	}
}

type ItemType = {
	name: string,
	inventoryType: InventoryType,
	bonusLists: number[],
	itemLevel: number,
	id: number,
	/* TODO: Complete the type */
}

type CacheConfigFile = {
	lastUpdate: number;
};

const writeCacheConfig = (config: CacheConfigFile) => {
	fs.writeFileSync(CACHE_META_FILEPATH, JSON.stringify(config));
};

const getCacheConfig = () => {

	let cacheConfig: CacheConfigFile;
	/* Check if the config file exists */
	if (!fs.existsSync(CACHE_META_FILEPATH)) {
		cacheConfig = { lastUpdate: 0 };
		writeCacheConfig(cacheConfig);
	} else
		cacheConfig = JSON.parse(fs.readFileSync(CACHE_META_FILEPATH, "utf-8"));

	return cacheConfig;
};

const fetchFileFromURL = async (url: string) => {
	const response = await fetch(url);
	const data = await response.json();

	return data;
};

const updateCache = (config: CacheConfigFile) => {
	for (let file of Object.values(CachedFiles)) {
		fetchFileFromURL(file.endpoint).then((data: any) => {

			console.log(`Updating ${file.fileName}`)
			file.data = data;
			fs.writeFileSync(
				path.join(CACHE_DIRECTORY, file.fileName),
				JSON.stringify(data),
			);
		});
	}
	config.lastUpdate = Date.now();
	return config;
};


export const queryEnchantment = (query: string) => {
	const regex = new RegExp(query, "i");
	const enchantments = CachedFiles.ENCHANTMENTS.data;

	return enchantments.filter((enchant: EnchantmentType) => enchant.displayName.match(regex));
}

export const queryItem = (query: string) => {
	const regex = new RegExp(query.replace(/[^\w ]/, ''), "i");
	const items = CachedFiles.EQUIPPABLE_ITEMS.data;

	return items.filter((item: ItemType) => item.name.replace(/[^\w ]/, '').match(regex));
}


export const initialise = () => {
	let cacheConfig = getCacheConfig();
	const timeSinceUpdate = Date.now() - cacheConfig.lastUpdate;

	/* Update the cache, if time exceeds 1 day */
	if (timeSinceUpdate > MS_PER_DAY) {
		/* Update the configs */
		cacheConfig = updateCache(cacheConfig);
		writeCacheConfig(cacheConfig);
	}
	else {
		for (let file of Object.values(CachedFiles)) {
			const filePath = path.join(CACHE_DIRECTORY, file.fileName)
			const data = JSON.parse(fs.readFileSync(filePath).toString());
			file.data = data;
		}
	}


};
