import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { getIngredientBrandIssue } from '@/core/drinks/helpers/ingredient.helpers';
import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { genderValidation } from '@/shared/schemas/gender.schemas';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

export const INGREDIENT_DESCRIPTION_MAX_LENGTH = 120;
export const INGREDIENT_BRAND_MAX_LENGTH = 60;

// Fields validation
export const ingredientIdValidation = getObjectIdSchema({
	required: 'apiResponses.ingredients.requiredId',
	invalid: 'apiResponses.ingredients.invalidIdFormat',
});

export const ingredientNameValidation = z
	.string({ error: 'apiResponses.ingredients.requiredName' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { error: 'apiResponses.ingredients.invalidNameFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

// Written like the name: lower-cased, then the first letter capitalized.
export const ingredientNamePluralValidation = z
	.string({ error: 'apiResponses.ingredients.invalidNamePluralFormat' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { error: 'apiResponses.ingredients.invalidNamePluralFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const ingredientCategoryIdValidation = getObjectIdSchema({
	required: 'apiResponses.ingredients.requiredCategory',
	invalid: 'apiResponses.ingredients.invalidCategoryFormat',
});

export const ingredientUnitIdValidation = getObjectIdSchema({
	required: 'apiResponses.ingredients.requiredUnit',
	invalid: 'apiResponses.ingredients.invalidUnitFormat',
});

/**
 * Allowed units in display order. An empty list means the ingredient is not measurable.
 * The same unit may not appear twice.
 */
export const ingredientUnitIdsValidation = z
	.array(ingredientUnitIdValidation, { error: 'apiResponses.ingredients.invalidUnitFormat' satisfies LocaleKey })
	.refine((ids) => new Set(ids).size === ids.length, {
		error: 'apiResponses.ingredients.duplicateUnit' satisfies LocaleKey,
	});

export const ingredientDescriptionValidation = z
	.string({ error: 'apiResponses.ingredients.invalidDescriptionFormat' satisfies LocaleKey })
	.trim()
	.min(1, { error: 'apiResponses.ingredients.invalidDescriptionFormat' satisfies LocaleKey })
	.max(INGREDIENT_DESCRIPTION_MAX_LENGTH, {
		error: 'apiResponses.ingredients.invalidDescriptionFormat' satisfies LocaleKey,
	});

export const ingredientKindValidation = z.enum(IngredientKinds, {
	error: 'apiResponses.ingredients.invalidKindFormat' satisfies LocaleKey,
});

// The brand is a proper noun, so its casing is kept as typed.
export const ingredientBrandValidation = z
	.string({ error: 'apiResponses.ingredients.invalidBrandFormat' satisfies LocaleKey })
	.trim()
	.min(1, { error: 'apiResponses.ingredients.invalidBrandFormat' satisfies LocaleKey })
	.max(INGREDIENT_BRAND_MAX_LENGTH, { error: 'apiResponses.ingredients.invalidBrandFormat' satisfies LocaleKey });

/**
 * Cross-field rule: a brand is required for `branded` ingredients and only allowed for them.
 *
 * When the request does not state the kind (update only), the schema cannot know which one the
 * ingredient currently has, so it leaves the decision to the domain, which checks the kind and
 * brand the ingredient will end up with. On create the kind always has a value (it defaults to
 * `generic`), so the rule is checked there.
 */
export const refineIngredientBrand = (
	{ kind, brand }: { kind?: string; brand?: string | null },
	ctx: z.RefinementCtx,
) => {
	if (kind === undefined) return;
	const issue = getIngredientBrandIssue(kind, brand);
	if (issue) ctx.addIssue({ code: 'custom', message: issue, path: ['brand'] });
};

// schemas
// The gender is optional per language; use `requireGenderFor` on the translations to require it where needed.
export const ingredientTranslationSchema = z.object({
	name: ingredientNameValidation,
	namePlural: ingredientNamePluralValidation.optional(),
	description: ingredientDescriptionValidation.optional(),
	gender: genderValidation.optional(),
});

// On update, omitting the description or the plural name keeps it and `null` removes it.
export const ingredientUpdateTranslationSchema = z.object({
	name: ingredientNameValidation,
	namePlural: ingredientNamePluralValidation.nullable().optional(),
	description: ingredientDescriptionValidation.nullable().optional(),
	gender: genderValidation.optional(),
});
