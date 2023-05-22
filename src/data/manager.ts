import * as fs from "fs";
import * as path from "path";

const MS_PER_DAY = 86400000; // 24 * 60 * 60 * 1000
const CACHE_CONFIG_FILE = path.join("src", "data", "cache", ".meta.json");

type CacheConfigFile = {
	lastUpdate: number;
};

const writeCacheConfig = (config: CacheConfigFile) => {
	fs.writeFileSync(CACHE_CONFIG_FILE, JSON.stringify(config));
};

const getCacheConfig = () => {
	let cacheConfig: CacheConfigFile;
	/* Check if the config file exists */
	if (!fs.existsSync(CACHE_CONFIG_FILE)) {
		cacheConfig = { lastUpdate: Date.now() };
		writeCacheConfig(cacheConfig);
	} else
		cacheConfig = JSON.parse(fs.readFileSync(CACHE_CONFIG_FILE, "utf-8"));

	return cacheConfig;
};

const fetchFileFromURL = async (url: string) => {
	const response = await fetch(url);
	const data = await response.json();

	return data;
};

const updateConfig = (config: CacheConfigFile) => {
	const endpoints = [
		"https://www.raidbots.com/static/data/live/enchantments.json",
		"https://www.raidbots.com/static/data/live/equippable-items.json",
	];
	for (let endpoint of endpoints) {
		fetchFileFromURL(endpoint).then((data) => {
			fs.writeFileSync(
				path.join("src", "data", "cache", endpoint.split("/").pop()!),
				JSON.stringify(data),
			);
		});
	}
	config.lastUpdate = Date.now();
	return config;
};

export const initialise = () => {
	let cacheConfig = getCacheConfig();
	const timeSinceUpdate = Date.now() - cacheConfig.lastUpdate;

	/* Update the cache, if time exceeds 1 day */
	if (timeSinceUpdate > MS_PER_DAY) {
		/* Update the configs */
		cacheConfig = updateConfig(cacheConfig);
	}
};
