import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import * as path from "path";
import * as fs from "fs";

function findSimExecutable() {
	const dir = fs.readdirSync("../").filter((dir) => {
		return dir.startsWith("simc") && !dir.endsWith(".7z");
	})
	return path.resolve("..", path.join(dir[0], "simc.exe"));
}

export function Sim(simString: string, id: string): ChildProcessWithoutNullStreams {

	const simExec = findSimExecutable();

	/* simc.exe filepath.txt */

	const tempFilePath = path.resolve(path.join("src", "temp", id));
	fs.writeFileSync(tempFilePath, simString);

	const process = spawn(`${simExec}`, [tempFilePath])


	return process;
}

