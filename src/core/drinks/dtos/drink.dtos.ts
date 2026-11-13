import {
	Drink,
	DrinkGarnish,
	DrinkIngredient,
	DrinkIngredientQualifier,
	DrinkTranslation,
} from '@/core/drinks/entities/drink.entity';
import { DrinkIngredientAmountTypes, DrinkMatchMaxMissing } from '@/core/drinks/constants/drink.constants';
import type { PreparationPlan } from '@/core/drinks/modules/preparation';
import { Translations } from '@/core/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

/**
 * A recipe line as it arrives from the API, before the service resolves the ingredient
 * and unit snapshots. The unit is referenced by `unitId`.
 */
export type DrinkIngredientAmountInput =
	| { type: typeof DrinkIngredientAmountTypes.exact; quantity: number; unitId: string }
	| {
			type: typeof DrinkIngredientAmountTypes.qualitative;
			qualifier: DrinkIngredientQualifier;
			quantity?: number;
			unitId?: string;
	  }
	| { type: typeof DrinkIngredientAmountTypes.none };

/** What an ingredient line and a garnish line have in common as they arrive from the API. */
export type DrinkRecipeItemInput = {
	ingredientId: string;
	amount: DrinkIngredientAmountInput;
};

export type DrinkIngredientInput = DrinkRecipeItemInput & {
	optional: boolean;
};

/** A garnish is always optional by nature, so it has no `optional` flag. */
export type DrinkGarnishInput = DrinkRecipeItemInput;

/**
 * A drink translation as it arrives from the API. The method may be left out when a preparation plan is sent,
 * because the plan writes it.
 */
export type DrinkTranslationInput = {
	name: string;
	method?: string;
};

export type DrinkData = {
	translations: Translations<DrinkTranslation>;
	ingredients: DrinkIngredient[];
	/** Defaults to no garnishes when omitted. */
	garnishes?: DrinkGarnish[];
	preparation?: PreparationPlan;
};

/** `createdBy` is set once, when the drink is created, and is never part of an update. */
export type CreateDrink = DrinkData & { createdBy: string };

export type UpdateDrink = { id: string; updatedBy: string } & DeepPartial<
	Pick<Drink, 'translations' | 'ingredients' | 'garnishes' | 'cover' | 'thumbnail'>
> & {
		/** A plan replaces the stored one; `null` removes it (the method was written by hand). */
		preparation?: PreparationPlan | null;
	};

export type UpdateDrinkCover = {
	id: string;
	cover: string;
};
export type UpdateDrinkThumbnail = {
	id: string;
	thumbnail: string;
};

export type FindDrinkByName = DeepPartial<Translations<{ name: string }>>;

export type DrinkMatchMaxMissingValue = (typeof DrinkMatchMaxMissing)[number];

/**
 * Finds the drinks that can be made, or nearly, with the ingredients a person has. Only the required ingredients of
 * a drink count (the optional ones and the garnishes do not), and the drink must use at least one of `ingredientIds`.
 */
export type FindDrinksByIngredients = {
	ingredientIds: string[];
	/** How many required ingredients may be missing; `any` puts no limit on it. */
	maxMissing: DrinkMatchMaxMissingValue;
	limit?: number;
	page?: number;
};

/** A drink found by its ingredients, with the required ingredients the person does not have. */
export type DrinkIngredientMatch = {
	drink: Drink;
	missingIngredientIds: string[];
};

export type RatingCountDelta = -1 | 0 | 1;

/** A change to the rating tally of a drink: how many ratings it gains or loses and how much the sum moves. */
export type ApplyRatingDelta = {
	drinkId: string;
	countDelta: RatingCountDelta;
	sumDelta: number;
};

export type DrinkRatingSummary = {
	average: number;
	count: number;
};
