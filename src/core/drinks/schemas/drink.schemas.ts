import { DrinkIngredientAmountTypes, DrinkIngredientQualifiers } from '@/core/drinks/constants/drink.constants';
import { findDuplicateKeyIndexes, getRecipeItemKey, hasRequiredIngredient } from '@/core/drinks/helpers/recipe.helpers';
import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { Language, Languages } from '@/core/drinks/types/translations';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

// Fields validation
export const drinkIdValidation = getObjectIdSchema({
	required: 'apiResponses.drinks.requiredId',
	invalid: 'apiResponses.drinks.invalidIdFormat',
});

export const drinkNameValidation = z
	.string({ error: 'apiResponses.drinks.requiredName' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { error: 'apiResponses.drinks.invalidNameFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const drinkMethodValidation = z
	.string({ error: 'apiResponses.drinks.requiredMethod' satisfies LocaleKey })
	.trim()
	.min(1, { error: 'apiResponses.drinks.invalidMethodFormat' satisfies LocaleKey });

export const drinkCoverValidation = z
	.string({ error: 'apiResponses.drinks.requiredCover' satisfies LocaleKey })
	.min(1, { error: 'apiResponses.drinks.invalidCoverFormat' satisfies LocaleKey });

export const drinkThumbnailValidation = z
	.string({ error: 'apiResponses.drinks.requiredThumbnail' satisfies LocaleKey })
	.min(1, { error: 'apiResponses.drinks.invalidThumbnailFormat' satisfies LocaleKey });

export const drinkIngredientIdValidation = getObjectIdSchema({
	required: 'apiResponses.drinks.requiredIngredientId',
	invalid: 'apiResponses.drinks.invalidIngredientIdFormat',
});

const drinkIngredientUnitIdValidation = getObjectIdSchema({
	required: 'apiResponses.drinks.requiredAmountUnit',
	invalid: 'apiResponses.drinks.invalidIngredientIdFormat',
});

const drinkQuantityValidation = z
	.number({ error: 'apiResponses.drinks.requiredQuantity' satisfies LocaleKey })
	.gt(0, { error: 'apiResponses.drinks.invalidQuantityFormat' satisfies LocaleKey });

/**
 * The amount of an ingredient in a recipe line. The unit, when present, is sent as `unitId`;
 * the service resolves it to a full unit snapshot from the ingredient's units.
 */
export const drinkIngredientAmountValidation = z.discriminatedUnion(
	'type',
	[
		z.object({
			type: z.literal(DrinkIngredientAmountTypes.exact),
			quantity: drinkQuantityValidation,
			unitId: drinkIngredientUnitIdValidation,
		}),
		z.object({
			type: z.literal(DrinkIngredientAmountTypes.qualitative),
			qualifier: z.enum(DrinkIngredientQualifiers, {
				error: 'apiResponses.drinks.invalidQualifierFormat' satisfies LocaleKey,
			}),
			// Optional approximate hint (e.g. ≈ 120 ml). When a quantity is given, a unit is required.
			quantity: drinkQuantityValidation.optional(),
			unitId: drinkIngredientUnitIdValidation.optional(),
		}),
		z.object({
			type: z.literal(DrinkIngredientAmountTypes.none),
		}),
	],
	{ error: 'apiResponses.drinks.invalidAmountTypeFormat' satisfies LocaleKey },
);

const drinkRecipeItemShape = {
	ingredientId: drinkIngredientIdValidation,
	amount: drinkIngredientAmountValidation,
};

export const drinkIngredientValidation = z.object({
	...drinkRecipeItemShape,
	optional: z.boolean({ error: 'apiResponses.drinks.invalidOptionalFormat' satisfies LocaleKey }).default(false),
});

// A garnish is always optional by nature, so it carries no `optional` flag.
export const drinkGarnishValidation = z.object(drinkRecipeItemShape);

type RecipeItemInput = z.infer<typeof drinkGarnishValidation>;

/** The unit a line is measured in, if any (`none` and a unitless qualitative have none). */
const getAmountUnitId = ({ amount }: RecipeItemInput): string | undefined =>
	'unitId' in amount ? amount.unitId : undefined;

/** A qualitative hint with a quantity must name its unit. */
const refineQualitativeHasUnit = (items: RecipeItemInput[], ctx: z.RefinementCtx) => {
	items.forEach(({ amount }, index) => {
		if (
			amount.type === DrinkIngredientAmountTypes.qualitative &&
			amount.quantity !== undefined &&
			amount.unitId === undefined
		) {
			ctx.addIssue({
				code: 'custom',
				message: 'apiResponses.drinks.requiredAmountUnit' satisfies LocaleKey,
				path: [index, 'amount', 'unitId'],
			});
		}
	});
};

/**
 * An ingredient may repeat within a list only with different units. The rule itself lives in the
 * domain (`recipe.helpers`) and is reused here to report the offending line with its path.
 */
const refineUniqueIngredientUnit = (items: RecipeItemInput[], ctx: z.RefinementCtx) => {
	const keys = items.map((item) => getRecipeItemKey(item.ingredientId, getAmountUnitId(item)));
	findDuplicateKeyIndexes(keys).forEach((index) => {
		ctx.addIssue({
			code: 'custom',
			message: 'apiResponses.drinks.duplicateIngredientUnit' satisfies LocaleKey,
			path: [index, 'ingredientId'],
		});
	});
};

export const drinkIngredientsValidation = z
	.array(drinkIngredientValidation)
	.min(1, { error: 'apiResponses.drinks.requiredIngredients' satisfies LocaleKey })
	.superRefine(refineQualitativeHasUnit)
	.superRefine(refineUniqueIngredientUnit)
	// A recipe needs at least one ingredient that is not optional.
	.refine((ingredients) => hasRequiredIngredient(ingredients), {
		error: 'apiResponses.drinks.requiredMainIngredient' satisfies LocaleKey,
	});

// Garnishes are optional: the list may be empty.
export const drinkGarnishesValidation = z
	.array(drinkGarnishValidation)
	.superRefine(refineQualitativeHasUnit)
	.superRefine(refineUniqueIngredientUnit);

// schemas
export const drinkTranslationSchema = z.object({
	name: drinkNameValidation,
	method: drinkMethodValidation,
});

/**
 * What a drink translation looks like in a request: the method may be left out because a preparation plan
 * writes it. `requireMethodOrPreparation` closes that gap at the level of the whole request.
 */
export const drinkTranslationInputSchema = z.object({
	name: drinkNameValidation,
	method: drinkMethodValidation.optional(),
});

/**
 * Edge rule of a request that carries translations and an optional preparation plan: without a plan every
 * language must bring its own method. With a plan the methods are written from it, so sending one is rejected.
 */
export const requireMethodOrPreparation = (
	{ translations, preparation }: { translations: Record<Language, { method?: string }>; preparation?: unknown },
	ctx: z.RefinementCtx,
): void => {
	(Object.values(Languages) as Language[]).forEach((language) => {
		const hasMethod = translations[language].method !== undefined;
		if (preparation === undefined && !hasMethod) {
			ctx.addIssue({
				code: 'custom',
				message: 'apiResponses.drinks.requiredMethod' satisfies LocaleKey,
				path: ['translations', language, 'method'],
			});
		}
		if (preparation !== undefined && hasMethod) {
			ctx.addIssue({
				code: 'custom',
				message: 'apiResponses.drinks.methodWithPreparation' satisfies LocaleKey,
				path: ['translations', language, 'method'],
			});
		}
	});
};
