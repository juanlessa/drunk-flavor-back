export const IceKinds = {
	cubes: 'cubes',
	crushed: 'crushed',
	largeCube: 'large_cube',
	sphere: 'sphere',
} as const;

export const Intensities = {
	gentle: 'gentle',
	normal: 'normal',
	vigorous: 'vigorous',
} as const;

/** `none` means pouring without a strainer. */
export const StrainKinds = {
	single: 'single',
	double: 'double',
	fine: 'fine',
	none: 'none',
} as const;

/**
 * How a garnish is put on the drink.
 *
 * `express` and `flame` release the oils of a citrus peel over the drink (`flame` passes them through a flame
 * first). The peel is then used as the garnish, or thrown away when the style says so.
 */
export const GarnishStyles = {
	express: 'express',
	expressAndDiscard: 'express_and_discard',
	flame: 'flame',
	flameAndDiscard: 'flame_and_discard',
	skewer: 'skewer',
	rimPerch: 'rim_perch',
	float: 'float',
	sprinkle: 'sprinkle',
} as const;

/** What `prepare_glass` does to the serving glass. */
export const GlassPreparationModes = {
	chill: 'chill',
	warm: 'warm',
	rinse: 'rinse',
	rim: 'rim',
} as const;

export const RimCoverages = {
	full: 'full',
	half: 'half',
} as const;

/** The two lists of a drink an action can take items from. */
export const RecipeLists = {
	ingredients: 'ingredients',
	garnishes: 'garnishes',
} as const;
