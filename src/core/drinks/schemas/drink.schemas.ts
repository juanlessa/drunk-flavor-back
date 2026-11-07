import {
	DrinkIngredientAmountTypes,
	DrinkIngredientQualifiers,
	DrinkIngredientRoles,
} from '@/core/drinks/constants/drink.constants';
import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
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

export const drinkIngredientValidation = z.object({
	ingredientId: drinkIngredientIdValidation,
	role: z
		.enum(DrinkIngredientRoles, { error: 'apiResponses.drinks.invalidRoleFormat' satisfies LocaleKey })
		.default(DrinkIngredientRoles.ingredient),
	amount: drinkIngredientAmountValidation,
	optional: z.boolean({ error: 'apiResponses.drinks.invalidOptionalFormat' satisfies LocaleKey }).default(false),
});

export const drinkIngredientsValidation = z
	.array(drinkIngredientValidation)
	.min(1, { error: 'apiResponses.drinks.requiredIngredients' satisfies LocaleKey })
	// A qualitative hint with a quantity must name its unit.
	.superRefine((ingredients, ctx) => {
		ingredients.forEach((line, index) => {
			if (
				line.amount.type === DrinkIngredientAmountTypes.qualitative &&
				line.amount.quantity !== undefined &&
				line.amount.unitId === undefined
			) {
				ctx.addIssue({
					code: 'custom',
					message: 'apiResponses.drinks.requiredAmountUnit' satisfies LocaleKey,
					path: [index, 'amount', 'unitId'],
				});
			}
		});
	})
	// The same ingredient may repeat only with a different role.
	.superRefine((ingredients, ctx) => {
		const seen = new Set<string>();
		ingredients.forEach((line, index) => {
			const key = `${line.ingredientId}:${line.role}`;
			if (seen.has(key)) {
				ctx.addIssue({
					code: 'custom',
					message: 'apiResponses.drinks.duplicateIngredientRole' satisfies LocaleKey,
					path: [index, 'ingredientId'],
				});
			}
			seen.add(key);
		});
	})
	// A recipe needs at least one required, non-garnish ingredient.
	.refine(
		(ingredients) => ingredients.some((line) => line.role === DrinkIngredientRoles.ingredient && !line.optional),
		{ error: 'apiResponses.drinks.requiredMainIngredient' satisfies LocaleKey },
	);

// schemas
export const drinkTranslationSchema = z.object({
	name: drinkNameValidation,
	method: drinkMethodValidation,
});
