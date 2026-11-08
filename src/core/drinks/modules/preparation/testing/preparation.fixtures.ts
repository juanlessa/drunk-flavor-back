import {
	PreparationAmount,
	PreparationDrink,
	PreparationDrinkGarnish,
	PreparationDrinkIngredient,
	PreparationIngredient,
	PreparationUnit,
} from '@/core/drinks/modules/preparation/entities/preparationDrink.entity';
import { RecipeItemRef } from '@/core/drinks/modules/preparation/entities/recipeItemRef.entity';
import { Gender } from '@/shared/types/gender.types';

// Fixtures of the preparation module tests. They are plain objects shaped like the recipe lines the module reads,
// so the tests never depend on the drink entities.

export const unit = (
	id: string,
	en: [singular: string, plural: string],
	pt: [singular: string, plural: string],
	gender: Gender,
	kind: PreparationUnit['kind'] = 'count',
): PreparationUnit => ({
	id,
	kind,
	translations: {
		en: { name: en[0], namePlural: en[1] },
		pt: { name: pt[0], namePlural: pt[1], gender },
	},
});

export const units = {
	ml: unit('ml', ['milliliter', 'milliliters'], ['mililitro', 'mililitros'], 'masculine', 'volume'),
	leaf: unit('leaf', ['leaf', 'leaves'], ['folha', 'folhas'], 'feminine'),
	sprig: unit('sprig', ['sprig', 'sprigs'], ['ramo', 'ramos'], 'masculine'),
	wedge: unit('wedge', ['wedge', 'wedges'], ['gomo', 'gomos'], 'masculine'),
	twist: unit('twist', ['twist', 'twists'], ['twist', 'twists'], 'masculine'),
	dash: unit('dash', ['dash', 'dashes'], ['dash', 'dashes'], 'masculine', 'informal'),
};

export const ingredient = (
	id: string,
	en: string,
	pt: string,
	gender: Gender,
	kind: PreparationIngredient['kind'] = 'generic',
): PreparationIngredient => ({
	id,
	kind,
	translations: { en: { name: en }, pt: { name: pt, gender } },
});

export const ingredients = {
	vodka: ingredient('vodka', 'Vodka', 'Vodka', 'feminine'),
	gin: ingredient('gin', 'Gin', 'Gin', 'masculine'),
	rum: ingredient('rum', 'Rum', 'Rum', 'masculine'),
	whisky: ingredient('whisky', 'Whisky', 'Whisky', 'masculine'),
	tequila: ingredient('tequila', 'Tequila', 'Tequila', 'feminine'),
	tripleSec: ingredient('triple-sec', 'Triple sec', 'Triple sec', 'masculine'),
	vermouth: ingredient('vermouth', 'Sweet vermouth', 'Vermute doce', 'masculine'),
	campari: ingredient('campari', 'Campari', 'Campari', 'masculine', 'branded'),
	absinthe: ingredient('absinthe', 'Absinthe', 'Absinto', 'masculine'),
	limeJuice: ingredient('lime-juice', 'Lime juice', 'Suco de limão', 'masculine'),
	lemonJuice: ingredient('lemon-juice', 'Lemon juice', 'Suco de limão siciliano', 'masculine'),
	syrup: ingredient('syrup', 'Simple syrup', 'Xarope simples', 'masculine'),
	eggWhite: ingredient('egg-white', 'Egg white', 'Clara de ovo', 'feminine'),
	tonic: ingredient('tonic', 'Tonic water', 'Água tônica', 'feminine'),
	bitters: ingredient('bitters', 'Angostura bitters', 'Angostura bitters', 'masculine'),
	mint: ingredient('mint', 'Mint', 'Hortelã', 'feminine'),
	lime: ingredient('lime', 'Lime', 'Limão', 'masculine'),
	orange: ingredient('orange', 'Orange', 'Laranja', 'feminine'),
	cherry: ingredient('cherry', 'Cherry', 'Cereja', 'feminine'),
	salt: ingredient('salt', 'Salt', 'Sal', 'masculine'),
};

export const exact = (quantity: number, measuredIn: PreparationUnit = units.ml): PreparationAmount => ({
	type: 'exact',
	quantity,
	unit: measuredIn,
});
export const noAmount: PreparationAmount = { type: 'none' };

export const line = (
	item: PreparationIngredient,
	amount: PreparationAmount = exact(30),
	optional = false,
): PreparationDrinkIngredient => ({ ingredient: item, amount, optional });
export const garnishLine = (
	item: PreparationIngredient,
	amount: PreparationAmount = noAmount,
): PreparationDrinkGarnish => ({ ingredient: item, amount });

export const drink = (
	recipeIngredients: PreparationDrinkIngredient[],
	garnishes: PreparationDrinkGarnish[] = [],
): PreparationDrink => ({ ingredients: recipeIngredients, garnishes });

/** A reference to an ingredient line measured in milliliters (the default unit of the fixtures). */
export const ml = (item: PreparationIngredient): RecipeItemRef => ({
	list: 'ingredients',
	ingredientId: item.id,
	unitId: units.ml.id,
});
/** A reference to an ingredient line with no unit. */
export const bare = (item: PreparationIngredient): RecipeItemRef => ({ list: 'ingredients', ingredientId: item.id });
/** A reference to a garnish line; pass the unit it is measured in, if any. */
export const garnishRef = (
	item: PreparationIngredient,
	measuredIn?: PreparationUnit,
	withUnit = false,
): RecipeItemRef => ({
	list: 'garnishes',
	ingredientId: item.id,
	...(measuredIn && { unitId: measuredIn.id }),
	...(withUnit && { withUnit }),
});
