import { randomUUID } from 'node:crypto';
import { DeepPartial } from '@/shared/types/utility.types';
import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
import { DrinkIngredientInput } from '@/core/drinks/dtos/drink.dtos';
import { Drink, DrinkIngredient, DrinkTranslation } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Translations } from '@/core/drinks/types/translations';
import { CreateDrinkCommand } from '../useCases/drinks/create/createDrink.dtos';

/**
 * Builds a drink ingredient request line with an exact amount. `unitId` defaults to the
 * ingredient's first unit, matching how a client usually picks a unit.
 */
export const createDrinkIngredientInputFactory = (
	ingredientId: string,
	overrides?: Partial<DrinkIngredientInput> & { unitId?: string },
): DrinkIngredientInput => ({
	ingredientId,
	amount: overrides?.amount ?? {
		type: DrinkIngredientAmountTypes.exact,
		quantity: 60,
		unitId: overrides?.unitId ?? '',
	},
	optional: overrides?.optional ?? false,
});

/**
 * Builds a persisted drink ingredient line with an exact amount from a full ingredient.
 * The amount defaults to `quantity` (60) in the ingredient's first unit; pass `amount` to override.
 */
export const createDrinkIngredientFactory = (
	ingredient: Ingredient,
	overrides?: Partial<Omit<DrinkIngredient, 'ingredient'>> & { quantity?: number },
): DrinkIngredient => ({
	ingredient,
	amount: overrides?.amount ?? {
		type: DrinkIngredientAmountTypes.exact,
		quantity: overrides?.quantity ?? 60,
		unit: ingredient.units[0],
	},
	optional: overrides?.optional ?? false,
});

/** A create request whose translations always carry the method, as a hand-written drink does. */
type CreateDrinkWithMethodCommand = Omit<CreateDrinkCommand, 'translations' | 'actor'> & {
	translations: Translations<DrinkTranslation>;
};
export const createDrinkFactory = (drink?: DeepPartial<CreateDrinkCommand>): CreateDrinkWithMethodCommand => ({
	translations: {
		en: {
			name: drink?.translations?.en?.name || 'Tequila sunrise',
			method: drink?.translations?.en?.method || 'preparation instructions ...',
		},
		pt: {
			name: drink?.translations?.pt?.name || 'Tequila sunrise',
			method: drink?.translations?.pt?.method || 'Modo de preparo ...',
		},
	},
	ingredients: (drink?.ingredients ?? []) as CreateDrinkCommand['ingredients'],
	garnishes: (drink?.garnishes ?? []) as NonNullable<CreateDrinkCommand['garnishes']>,
});

export const createPersistedDrinkFactory = (drink?: DeepPartial<Drink>): Drink => ({
	id: drink?.id ?? randomUUID(),
	translations: {
		en: {
			name: drink?.translations?.en?.name || 'Tequila sunrise',
			method: drink?.translations?.en?.method || 'preparation instructions ...',
		},
		pt: {
			name: drink?.translations?.pt?.name || 'Tequila sunrise',
			method: drink?.translations?.pt?.method || 'Modo de preparo ...',
		},
	},
	cover: drink?.cover,
	thumbnail: drink?.thumbnail,
	ingredients: (drink?.ingredients?.filter((ingredient) => ingredient !== undefined) as Drink['ingredients']) ?? [],
	garnishes: (drink?.garnishes?.filter((garnish) => garnish !== undefined) as Drink['garnishes']) ?? [],
	avgRating: drink?.avgRating ?? 0,
	ratingsCount: drink?.ratingsCount ?? 0,
	createdAt: (drink?.createdAt as Date | undefined) ?? new Date(),
	updatedAt: (drink?.updatedAt as Date | undefined) ?? new Date(),
});
