import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Language, Languages } from '@/core/drinks/types/translations';
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

/**
 * The languages that lack a plural name while the ingredient needs one. It is needed when any of its
 * units is written with the name of the ingredient (e.g. "3 limes"); otherwise it is optional.
 *
 * It is shared by the create and update flows, which pass the plural names the ingredient will end up with.
 */
export const getMissingNamePluralLanguages = (
	units: ReadonlyArray<Pick<Unit, 'useIngredientName'>>,
	namePlurals: Partial<Record<Language, string | null | undefined>>,
): Language[] => {
	if (!units.some((unit) => unit.useIngredientName === true)) return [];
	return (Object.keys(Languages) as Language[]).filter((language) => !namePlurals[language]?.trim());
};

/** Domain invariant of an ingredient, enforced whoever builds it (API, seed, scripts). */
export const assertIngredientNamePlural = (
	units: ReadonlyArray<Pick<Unit, 'useIngredientName'>>,
	namePlurals: Partial<Record<Language, string | null | undefined>>,
	path: string,
): void => {
	const [missing] = getMissingNamePluralLanguages(units, namePlurals);
	if (missing) {
		throw new BadRequestError('apiResponses.ingredients.requiredNamePluralForUnit', {
			path: `${path}.translations.${missing}.namePlural`,
		});
	}
};

/** Domain invariant of an ingredient, enforced whoever builds it (API, seed, scripts). */
export const assertIngredientBrand = (kind: string, brand: string | null | undefined, path: string): void => {
	const issue = getIngredientBrandIssue(kind, brand);
	if (issue) throw new BadRequestError(issue, { path });
};
