

export class SimOptions {
	// Consumables
	potion = "elemental_potion_of_ultimate_power_3";
	flask = "phial_of_tepid_versatility_3";
	food = "fated_fortune_cookie";
	augmentation = "draconic_augment_rune";

	// Expansion Options
	dragonflight_ominous_chromatic_essence_dragonflight = "obsidian";
	dragonflight_ominous_chromatic_essence_allies = "";
	dragonflight_blue_silken_lining_uptime = 0.7;
	dragonflight_corrupting_rage_uptime = 1;
	dragonflight_ruby_whelp_shell_training = "under_red_wings:6";
	dragonflight_primal_ritual_shell_blessing = "wind";
	dragonflight_whispering_incarnate_icon_roles = "dps/heal/tank";

	// Simulation Options
	iterations = 5000;
	desired_targets = 1;
	max_time = 300;
	calculate_scale_factors = 0;
	scale_only = "strength,intellect,agility,crit,mastery,vers,haste,weapon_dps,weapon_offhand_dps,stamina";
	override_bloodlust = 1;
	override_arcane_intellect = 1;
	override_power_word_fortitude = 1;
	override_battle_shout = 1;
	override_mystic_touch = 1;
	override_chaos_brand = 1;
	override_windfury_totem = 1;
	override_mark_of_the_wild = 1;
	override_bleeding = 1;
	report_details = 1;
	single_actor_batch = 1;
	optimize_expressions = 1;

	private get dotMembers() {
		return [
			"override_", "dragonflight_",]
	}

	constructor(options?: Partial<SimOptions>) {
		if (options) {
			Object.assign(this, options);
		}
	}

	export() {
		let output = "";
		for (const [key, value] of Object.entries(this)) {
			if (this.dotMembers.some((m) => key.startsWith(m))) {
				output += `${key.replace(/_/, '.')}=${value}\n`;
			}
			else {
				output += `${key}=${value}\n`;
			}
		}
		return output;
	}

	public static default() {
		return new SimOptions();
	}
}

/* 
# Consumables
potion=elemental_potion_of_ultimate_power_3
flask=phial_of_tepid_versatility_3
food=fated_fortune_cookie
augmentation=draconic_augment_rune

# Expansion Options
dragonflight.ominous_chromatic_essence_dragonflight=obsidian
dragonflight.ominous_chromatic_essence_allies=
dragonflight.blue_silken_lining_uptime=0.7
dragonflight.corrupting_rage_uptime=1
dragonflight.ruby_whelp_shell_training=under_red_wings:6
dragonflight.primal_ritual_shell_blessing=wind
dragonflight.whispering_incarnate_icon_roles=dps/heal/tank

# Simulation Options
iterations=5000
desired_targets=1
max_time=300
calculate_scale_factors=0
scale_only=strength,intellect,agility,crit,mastery,vers,haste,weapon_dps,weapon_offhand_dps,stamina
override.bloodlust=1
override.arcane_intellect=1
override.power_word_fortitude=1
override.battle_shout=1
override.mystic_touch=1
override.chaos_brand=1
override.windfury_totem=1
override.mark_of_the_wild=1
override.bleeding=1
report_details=1
single_actor_batch=1
optimize_expressions=1 
*/