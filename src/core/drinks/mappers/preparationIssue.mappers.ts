import { IssueCode, PreparationIssue } from '@/core/drinks/modules/preparation';
import { FieldError } from '@/shared/error/error.dtos';
import { LocaleKey } from '@/shared/types/locale.types';

/**
 * Every problem the preparation module can report, with the message that describes it. Declared as a complete
 * record, so a new issue code does not compile until it has a message here.
 */
const PREPARATION_ISSUE_LOCALE_KEYS = {
	empty_plan: 'apiResponses.drinks.preparation.emptyPlan',
	nothing_served: 'apiResponses.drinks.preparation.nothingServed',
	contents_left_in_mixing_vessel: 'apiResponses.drinks.preparation.contentsLeftInMixingVessel',
	dry_shake_without_wet_shake: 'apiResponses.drinks.preparation.dryShakeWithoutWetShake',
	invalid_item_list: 'apiResponses.drinks.preparation.invalidItemList',
	unknown_item: 'apiResponses.drinks.preparation.unknownItem',
	duplicate_item_use: 'apiResponses.drinks.preparation.duplicateItemUse',
	with_unit_without_unit: 'apiResponses.drinks.preparation.withUnitWithoutUnit',
	unused_required_ingredient: 'apiResponses.drinks.preparation.unusedRequiredIngredient',
	unused_garnish: 'apiResponses.drinks.preparation.unusedGarnish',
	glass_prepared_late: 'apiResponses.drinks.preparation.glassPreparedLate',
	empty_add: 'apiResponses.drinks.preparation.emptyAdd',
	ice_already_present: 'apiResponses.drinks.preparation.iceAlreadyPresent',
	nothing_to_muddle: 'apiResponses.drinks.preparation.nothingToMuddle',
	muddle_with_ice: 'apiResponses.drinks.preparation.muddleWithIce',
	shake_requires_shaker: 'apiResponses.drinks.preparation.shakeRequiresShaker',
	nothing_to_shake: 'apiResponses.drinks.preparation.nothingToShake',
	nothing_to_stir: 'apiResponses.drinks.preparation.nothingToStir',
	stir_without_ice: 'apiResponses.drinks.preparation.stirWithoutIce',
	nothing_to_strain: 'apiResponses.drinks.preparation.nothingToStrain',
	strain_without_ice: 'apiResponses.drinks.preparation.strainWithoutIce',
	strain_same_vessel: 'apiResponses.drinks.preparation.strainSameVessel',
	strain_over_ice_without_ice: 'apiResponses.drinks.preparation.strainOverIceWithoutIce',
	ice_poured_into_glass: 'apiResponses.drinks.preparation.icePouredIntoGlass',
	top_on_empty_glass: 'apiResponses.drinks.preparation.topOnEmptyGlass',
	empty_garnish: 'apiResponses.drinks.preparation.emptyGarnish',
	garnish_on_empty_glass: 'apiResponses.drinks.preparation.garnishOnEmptyGlass',
	custom_text_missing: 'apiResponses.drinks.preparation.customTextMissing',
} as const satisfies Record<IssueCode, LocaleKey>;

/**
 * Describes a problem of the preparation as the field error the API already uses for request validation. The
 * path is relative to a request body that carries the plan in a `preparation` field, and points at the action
 * (`preparation.actions.3`) or, for problems of the plan as a whole, at `preparation`.
 */
export const toPreparationFieldError = ({ code, actionIndex, params }: PreparationIssue): FieldError => ({
	location: 'body',
	path: actionIndex === undefined ? 'preparation' : `preparation.actions.${actionIndex}`,
	localeKey: PREPARATION_ISSUE_LOCALE_KEYS[code],
	...(params && { params }),
});
