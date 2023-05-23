import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import * as path from "path";
import * as fs from "fs";
import * as utilities from "../utilities.js";
import { SimOptions } from "./simOptions.js"

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

export function Sim(simString: string, id: string, simOptions?: SimOptions): ChildProcessWithoutNullStreams {

	if (!simOptions) simOptions = SimOptions.default();

	const simExec = findSimExecutable();

	console.log(simString + "\n" + simOptions.export());

	const tempFilePath = path.join(utilities.getDirectory(utilities.LocalDirectories.TEMPORARY_FILES), id);
	fs.writeFileSync(tempFilePath, simString + "\n" + simOptions.export());

	const process = spawn(`${simExec}`, [tempFilePath])


	return process;
}

