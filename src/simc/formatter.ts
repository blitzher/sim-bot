import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path"

export enum FormatType {
	GeneratorProgress = "GeneratorProgress",
	Result = "Result"
}

export type GeneratorSegmentType = {
	name: string,
	progress: number,
	total: number,
}
export type ResultType = {
	name: string,
	dps: number,
};

export class Formatter {
	public readonly id: string;

	private emitter: EventEmitter
	private debugFile: fs.PathLike;
	private stringBuffer = "";
	private results: ResultType[] = [];

	constructor(id: string) {
		this.id = id;
		this.emitter = new EventEmitter();
		this.debugFile = path.join("src", "simc-results", id);
	}

	feed(segment: string): void {
		const generatorRegex = /Generating Baseline: (?<name>.+?) \[[=.>]+\] (?<progress>\d+)\/(?<total>\d+)/
		const resultRegex = /Player: (?<name>[\w\W]+?)\r?\n  DPS=(?<dps>[\d]+)/g

		const generatorMatch = segment.match(generatorRegex);
		if (generatorMatch && generatorMatch.length > 0 && generatorMatch.groups) {
			const generatorSegment: GeneratorSegmentType = {
				name: generatorMatch.groups.name,
				progress: Number.parseInt(generatorMatch.groups.progress),
				total: Number.parseInt(generatorMatch.groups.total)
			}
			this.emitter.emit(FormatType.GeneratorProgress, generatorSegment);
		}

		const resultMatch = Array.from(segment.matchAll(resultRegex))
		if (resultMatch && resultMatch.length > 0) {
			for (let result of resultMatch) {
				if (!result.groups)
					continue;
				this.results.push({
					name: result.groups.name.split(" ").slice(0, -4).join(" "),
					dps: Number.parseInt(result.groups.dps)
				})
			}
			this.emitter.emit(FormatType.Result, this.results);
		}
	}

	on(arg: FormatType.GeneratorProgress, callback: (res: GeneratorSegmentType) => any): void;
	on(arg: FormatType.Result, callback: (res: ResultType[]) => any): void;
	on(arg: FormatType, callback: (...any: any[]) => any): void {
		this.emitter.on(arg, callback);
	}
}