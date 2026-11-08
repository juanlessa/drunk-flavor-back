/** Where the drink is prepared. `servingGlass` means the drink is built directly in the glass. */
export const MixingVessels = {
	shaker: 'shaker',
	mixingGlass: 'mixing_glass',
	pitcher: 'pitcher',
	servingGlass: 'serving_glass',
} as const;

export const ServingGlasses = {
	martini: 'martini',
	coupe: 'coupe',
	nickAndNora: 'nick_and_nora',
	flute: 'flute',
	highball: 'highball',
	collins: 'collins',
	rocks: 'rocks',
	doubleRocks: 'double_rocks',
	hurricane: 'hurricane',
	copperMug: 'copper_mug',
	wine: 'wine',
	shot: 'shot',
	snifter: 'snifter',
	julepCup: 'julep_cup',
	tikiMug: 'tiki_mug',
	heatproofMug: 'heatproof_mug',
} as const;

/** Actions refer to vessels by role, so a built drink (mixing === serving) needs no special casing. */
export const VesselRoles = {
	mixing: 'mixing',
	serving: 'serving',
} as const;
