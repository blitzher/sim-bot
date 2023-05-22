import * as path from "path";
import * as fs from "fs";
import { CommandInteraction } from "discord.js";
import { SimCProfile } from "./simcprofile.js";

export const ErrorReplies = {
	PROFILE_INVALID:
		"Could not read profile string. Make sure you used the *nb* argument and did not alter the profile before adding it.",
	PROFILE_ALREADY_EXISTS:
		"Profile could not be added, as a profile with that name already exists. If you meant to update it, please use the /updateprofile command.",
	PROFILE_NOT_FOUND: (profileName: string) =>
		`Profile \`${profileName}\`could not be found. If you meant to add it, please use the /addprofile command.`,

	ERROR_UNKNOWN: "Unknown error occured.",

	COMPARATOR_NOT_RUNNING:
		"Cannot run this command while a comparison is not in progress.",
};

/* User error class */
export class UserError extends Error {}

export enum LocalDirectories {
	PROFILES,
	SIMC_RESULTS,
	TEMPORARY_FILES,
}

const directories: { [key in LocalDirectories]: string[] } = {
	0: ["profiles"],
	1: ["src", "simc-results"],
	2: ["temp"],
};

export const minimizeSimcProfile = (profileString: string) => {
	const re = /(# )?[\w.]+=(".+?"|[^ ]+)/g;
	const matches = profileString.match(re);

	if (!matches || matches.length == 0) return;

	/* Filter out comments */
	const filtered = matches?.filter((m) => !m.startsWith("#"));
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

export const resolveSimulationProfile = (userId: string, argument: string) => {
	let profile = getUserProfile(userId, argument);
	if (!profile) {
		profile = minimizeSimcProfile(argument);
		if (!profile) {
			throw new UserError(ErrorReplies.PROFILE_INVALID);
		}
	}

	return profile;
};
