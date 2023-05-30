import * as path from "path";
import * as fs from "fs";
import { SimCProfile } from "./simcprofile.js";
import { CommandInteraction } from "discord.js";
import { S3Uploader } from "./aws/s3Uploader.js";

export const ErrorReplies = {
	PROFILE_INVALID: "Could not read profile string. Make sure you used the *nb* argument and did not alter the profile before adding it",
	PROFILE_ALREADY_EXISTS: (profileName: string) => `Profile \`${profileName}\` could not be added, as a profile with that name already exists. If you meant to update it, please use the /updateprofile command.`,
	PROFILE_NOT_FOUND: (profileName: string) => `Profile \`${profileName}\`could not be found. If you meant to add it, please use the /addprofile command.`,
	INVALID_SIM_ARGUMENT: "The argument you have passed is not a profile name or valid SimC input string.",
	CANNOT_FIND_ITEM_WOW_API: (nameOfItem: string) => `Search found no items with name ${nameOfItem}`,
	COMPARATOR_NOT_RUNNING:
		"Cannot run this command while a comparison is not in progress.",
	ERROR_UNKNOWN: "Unknown error occured",
	ITEM_INVALID: (itemName: string) => `Could not find a valid item with the name ${itemName}.`,
	ITEM_MISSING_SLOT: (itemName: string) => `Item ${itemName} requires a slot number 1 or 2.`
}

export class UserError extends Error { }

export enum LocalDirectories {
	PROFILES,
	SIMC_RESULTS,
	TEMPORARY_FILES,
	DATA_CACHE,
}

export const getDirectory = (key: LocalDirectories) => {
	const fullPath = path.resolve(path.join(...directories[key]));
	if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
	return fullPath;
};

export const getUserProfilesDirectory = (id: string) => {
	const fullPath = path.join(getDirectory(LocalDirectories.PROFILES), id);
	if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
	return fullPath;
};

export const getUserProfile = (id: string, profileName: string) => {
	const fullPath = path.join(
		getDirectory(LocalDirectories.PROFILES),
		id,
		profileName,
	);
	if (!fs.existsSync(fullPath)) return;
	const profile = new SimCProfile(fs.readFileSync(fullPath).toString());
	return profile;
};

const directories: { [key in LocalDirectories]: string[] } = {
	0: ["profiles"],
	1: ["src", "simc-results"],
	2: ["temp"],
	3: ["src", "data", "cache"],
};

export const minimizeSimcProfile = (profileString: string) => {
	const re = /(# )?[\w.]+=(".+?"|[^ ]+)/g;
	const matches = profileString.match(re);

	if (!matches || matches.length == 0) return;

	const filtered = matches?.filter((m) => !m.startsWith("#"))
	const simString = filtered?.join("\n") || "";

	return new SimCProfile(simString);
};

/**
 * Default error handling, which replies to the message if the error is of the type `UserError`,
 * with the error message. Otherwise, it responds to the user that an unkown error occured, and
 * logs the error.
 * @param interaction The interaction which caused the error
 * @param error The error object
 */
export const defaultErrorHandle = (
	interaction: CommandInteraction,
	error: unknown | Error,
) => {
	if (error instanceof UserError) {
		interaction.reply(error.message);
	} else {
		interaction.reply(ErrorReplies.ERROR_UNKNOWN);
		console.log(error);
	}
};

export const getSimProfileFromS3 = async (userId: string, profileName: string) => {
	try {
		const s3Client = new S3Uploader();
		const profileResponse = await s3Client.getObject(userId + '/' + profileName, "cal-dev-raiderprofiles");
		const profileString = await profileResponse?.Body?.transformToString();
		if(profileString) return new SimCProfile(profileString);
	}
	catch (err) {
		return undefined; //Add logger here once it's been implemented
	}
}

export const resolveSimulationProfile = async (userId: string, argument: string) => {
	let profile = await getSimProfileFromS3(userId, argument);
	if (!profile) {
		profile = minimizeSimcProfile(argument);
		if (!profile) {
			throw new UserError(ErrorReplies.PROFILE_INVALID);
		}
	}
	return profile;
};
