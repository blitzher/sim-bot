import fs from "fs";

const itemSlots = [
	"head",
	"neck",
	"shoulder",
	"back",
	"chest",
	"wrist",
	"hands",
	"waist",
	"legs",
	"feet",
	"finger1",
	"finger2",
	"trinket1",
	"trinket2",
	"main_hand",
	"off_hand",
]

export interface SimCItemData {
	slot: string;
	id: number;
	name?: string
	enchant_id?: number
	gem_id?: number[]
	bonus_id?: number[]
	crafted_stats?: number[]
	crafting_quality?: number
	ilvl?: number
}

export class SimCItem implements SimCItemData {

	slot: string;
	id!: number;
	name?: string
	enchant_id?: number
	gem_id?: number[]
	bonus_id?: number[]
	crafted_stats?: number[]
	crafting_quality?: number
	ilvl?: number;

	[key: string]: any

	private static arrayTypes = [
		"gem_id",
		"bonus_id",
		"crafted_stats"
	]

	constructor(slot: string, item: string) {
		this.slot = slot;
		const regex = /(?<name>\w*)?,id=(?<id>\d+)(,enchant_id=(?<enchant_id>\d+))?(,gem_id=(?<gem_id>[\d\/]+))?(,bonus_id=(?<bonus_id>[\d\/]+))?(,crafted_stats=(?<crafted_stats>[\d\/]+))?(,crafting_quality=(?<crafting_quality>\d+))?/gm

		const match = item.matchAll(regex)
		for (let m of match) {
			if (!m.groups) continue;


			for (const [key, value] of Object.entries(m.groups)) {


				if (SimCItem.arrayTypes.includes(key) && value)
					this[key] = value.split("/");
				else if (key == "name") {
					this[key] = value;
				}
				else if (value) {
					this[key] = Number.parseInt(value);
				}
			}
		}
	}

	public get fullstring() {
		return SimCItem.fullstring(this);
	}

	public static fullstring(item: SimCItemData) {
		let base = `${item.slot}=${item.name || ''},id=${item.id}`
		if (item.enchant_id)
			base += `,enchant_id=${item.enchant_id}`
		if (item.gem_id)
			base += `,gem_id=${item.gem_id}`
		if (item.bonus_id)
			base += `,bonus_id=${item.bonus_id.join("/")}`
		if (item.crafted_stats)
			base += `,crafted_stats=${item.crafted_stats.join("/")}`
		if (item.crafting_quality)
			base += `,crafting_quality=${item.crafting_quality}`
		if (item.ilvl)
			base += `,ilevel=${item.ilvl}`
		return base;
	}
}
export class SimCProfile {

	warrior?: string
	paladin?: string
	hunter?: string
	rogue?: string
	priest?: string
	shaman?: string
	mage?: string
	warlock?: string
	monk?: string
	druid?: string
	demonhunter?: string
	deathknight?: string
	evoker?: string

	level!: number;
	race!: string;
	region!: string;
	server!: string;
	role!: string;
	spec!: string;
	talents!: string;

	head!: SimCItem;
	neck!: SimCItem;
	shoulder!: SimCItem;
	back!: SimCItem;
	chest!: SimCItem;
	wrist!: SimCItem;
	hands!: SimCItem;
	waist!: SimCItem;
	legs!: SimCItem;
	feet!: SimCItem;
	finger1!: SimCItem;
	finger2!: SimCItem;
	trinket1!: SimCItem;
	trinket2!: SimCItem;
	main_hand!: SimCItem;
	off_hand!: SimCItem;

	[key: string]: any

	private _fullstring: string;

	public constructor(profileString: string) {
		this._fullstring = profileString;
		const regex = /^(?<key>\w+)="?(?<value>[\w\W]+?)"?$/gm
		const match = profileString.matchAll(regex);

		for (let m of match) {
			if (!m.groups) continue;
			const { key, value } = m.groups;
			if (itemSlots.includes(key)) {
				this[key] = new SimCItem(key, value);
			}
			else {
				this[key] = value
			}
		}
	}

	public get name() {
		return this.warrior
			|| this.paladin
			|| this.hunter
			|| this.rogue
			|| this.priest
			|| this.shaman
			|| this.mage
			|| this.warlock
			|| this.monk
			|| this.druid
			|| this.demonhunter
			|| this.deathknight
			|| this.evoker
			|| "unknown";
	}

	public get class() {
		const classes = [
			"warrior",
			"paladin",
			"hunter",
			"rogue",
			"priest",
			"shaman",
			"mage",
			"warlock",
			"monk",
			"druid",
			"demonhunter",
			"deathknight",
			"evoker",]
		for (let c of classes)
			if (this[c]) return c
		return "unknown"
	}

	public get fullstring() {
		return this._fullstring;
	}
}

export const main = () => {
	const test_case = fs.readFileSync("profiles\\140086240572604416\\demo-st").toString();
	const profile = new SimCProfile(test_case);
	console.log(profile.chest);
}

