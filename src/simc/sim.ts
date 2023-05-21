import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import * as path from "path";
import * as fs from "fs";
import * as utilities from "../utilities.js";

function findSimExecutable() {
	const dir = fs.readdirSync("../").filter((dir) => {
		return dir.startsWith("simc") && !dir.endsWith(".7z");
	})
	const exeDir = dir[0];
	if (!exeDir) {
		throw new Error("Could not find simc directory.")
	}
	const exePath = path.resolve("..", path.join(dir[0], "simc.exe"));
	if (!fs.existsSync(exePath)) {
		throw new Error("Could not find simc executable");
	}
	return exePath;
}

export function Sim(simString: string, id: string): ChildProcessWithoutNullStreams {

	const simExec = findSimExecutable();

	/* simc.exe filepath.txt */

	const tempFilePath = path.join(utilities.getDirectory(utilities.LocalDirectories.TEMPORARY_FILES), id);
	fs.writeFileSync(tempFilePath, simString);

	const process = spawn(`${simExec}`, [tempFilePath])


	return process;
}

