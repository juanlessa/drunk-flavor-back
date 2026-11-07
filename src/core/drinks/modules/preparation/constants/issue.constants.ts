/** `error` blocks the method; `warning` is reported next to it. */
export const IssueSeverities = {
	error: 'error',
	warning: 'warning',
} as const;

/**
 * Stable, language-independent codes. Each one maps to a locale key at the edge of the application,
 * so the domain never carries text.
 */
export const IssueCodes = {
	// Whole plan
	emptyPlan: 'empty_plan',
	nothingServed: 'nothing_served',
	contentsLeftInMixingVessel: 'contents_left_in_mixing_vessel',
	dryShakeWithoutWetShake: 'dry_shake_without_wet_shake',

	// Recipe items
	invalidItemList: 'invalid_item_list',
	unknownItem: 'unknown_item',
	duplicateItemUse: 'duplicate_item_use',
	withUnitWithoutUnit: 'with_unit_without_unit',
	unusedRequiredIngredient: 'unused_required_ingredient',
	unusedGarnish: 'unused_garnish',

	// Actions
	glassPreparedLate: 'glass_prepared_late',
	emptyAdd: 'empty_add',
	iceAlreadyPresent: 'ice_already_present',
	nothingToMuddle: 'nothing_to_muddle',
	muddleWithIce: 'muddle_with_ice',
	shakeRequiresShaker: 'shake_requires_shaker',
	nothingToShake: 'nothing_to_shake',
	nothingToStir: 'nothing_to_stir',
	stirWithoutIce: 'stir_without_ice',
	nothingToStrain: 'nothing_to_strain',
	strainWithoutIce: 'strain_without_ice',
	strainSameVessel: 'strain_same_vessel',
	strainOverIceWithoutIce: 'strain_over_ice_without_ice',
	icePouredIntoGlass: 'ice_poured_into_glass',
	topOnEmptyGlass: 'top_on_empty_glass',
	emptyGarnish: 'empty_garnish',
	garnishOnEmptyGlass: 'garnish_on_empty_glass',
	customTextMissing: 'custom_text_missing',
} as const;
