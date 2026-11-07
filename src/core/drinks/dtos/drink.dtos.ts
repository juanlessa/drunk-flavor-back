import {
	Drink,
	DrinkIngredient,
	DrinkIngredientQualifier,
	DrinkIngredientRole,
	DrinkTranslation,
} from '@/core/drinks/entities/drink.entity';
import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
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

export type DrinkIngredientInput = {
	ingredientId: string;
	role: DrinkIngredientRole;
	amount: DrinkIngredientAmountInput;
	optional: boolean;
};

export type CreateDrink = {
	translations: Translations<DrinkTranslation>;
	ingredients: DrinkIngredient[];
};

export type UpdateDrink = { id: string } & DeepPartial<
	Pick<Drink, 'translations' | 'ingredients' | 'cover' | 'thumbnail'>
>;

export type UpdateDrinkCover = {
	id: string;
	cover: string;
};
export type UpdateDrinkThumbnail = {
	id: string;
	thumbnail: string;
};

export type DeleteDrink = {
	id: string;
};

export type GetDrink = {
	id: string;
};

export type FindDrinkByName = DeepPartial<Translations<{ name: string }>>;
