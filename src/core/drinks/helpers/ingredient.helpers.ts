import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { BadRequestError } from '@/shared/error/error.lib';
import type { LocaleKey } from '@/shared/types/locale.types';

/**
 * The problem with a kind and brand pair, if any: a `branded` ingredient needs a brand and any
 * other kind cannot have one. A missing kind counts as not branded, and a `null` brand as no brand.
 *
 * It is shared by the request schema and the domain so both apply the very same rule.
 */
export const getIngredientBrandIssue = (
	kind: string | undefined,
	brand: string | null | undefined,
): Extract<LocaleKey, `apiResponses.ingredients.${string}`> | undefined => {
	if (kind === IngredientKinds.branded && typeof brand !== 'string') {
		return 'apiResponses.ingredients.requiredBrand';
	}
	if (kind !== IngredientKinds.branded && typeof brand === 'string') {
		return 'apiResponses.ingredients.brandNotAllowed';
	}
	return undefined;
};

/** Domain invariant of an ingredient, enforced whoever builds it (API, seed, scripts). */
export const assertIngredientBrand = (kind: string, brand: string | null | undefined, path: string): void => {
	const issue = getIngredientBrandIssue(kind, brand);
	if (issue) throw new BadRequestError(issue, { path });
};
