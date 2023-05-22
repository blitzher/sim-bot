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


const CachedFiles = {
	ENCHANTMENTS: {
		fileName: "enchantments.json",
		endpoint: "https://www.raidbots.com/static/data/live/enchantments.json",
		data: undefined as any,
	},
	EQUIPPABLE_ITEMS: {
		fileName: "equippable-items.json",
		endpoint: "https://www.raidbots.com/static/data/live/equippable-items.json",
		data: undefined as any,
	}
}

type EnchantmentType = {
	"id": number,
	"displayName": string,
	"spellId": number,
	"spellIcon": string,
	"itemId": number,
	"itemName": string,
	"itemIcon": string,
	"quality": number,
	"expansion": number,
	"craftingQuality": number | undefined,
	"tokenizedName": string,
	"stats": [
		{
			"type": string,
			"amount": number
		}
	],
	"equipRequirements": {
		"itemClass": number,
		"itemSubClassMask": number,
		"invTypeMask": number
	}
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
		fetchFileFromURL(file.endpoint).then((data) => {

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
	for (let enchantment of enchantments) {
		if (regex.test(enchantment.name)) return enchantment;
	}

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


};
