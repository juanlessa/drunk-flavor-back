import { CreateDrinkDTO } from '@/core/drinks/useCases/drinks/create/createDrink.dtos';
import { resolveCreateDrinkService } from '@/core/drinks/useCases/drinks/create/createDrink.container';
import { DrinkGarnishInput, DrinkIngredientInput } from '@/core/drinks/dtos/drink.dtos';
import { Translations } from '@/core/drinks/types/translations';
import { DrinkTranslation } from '@/core/drinks/entities/drink.entity';
import { DrinkIngredientAmountTypes, DrinkIngredientQualifiers } from '@/core/drinks/constants/drink.constants';
import { logger } from '@/shared/providers/logger';
import { ingredientsMap } from './ingredients';

/**
 * A recipe line described by the ingredient's English name and the unit's English name.
 * They are resolved to ids when the seed runs.
 */
type SeedExactAmount = {
	type: typeof DrinkIngredientAmountTypes.exact;
	quantity: number;
	unit: string;
};
type SeedQualitativeAmount = {
	type: typeof DrinkIngredientAmountTypes.qualitative;
	qualifier: (typeof DrinkIngredientQualifiers)[keyof typeof DrinkIngredientQualifiers];
	quantity?: number;
	unit?: string;
};
type SeedNoneAmount = { type: typeof DrinkIngredientAmountTypes.none };

type SeedAmount = SeedExactAmount | SeedQualitativeAmount | SeedNoneAmount;

type SeedRecipeItem = {
	ingredient: string;
	amount: SeedAmount;
};

type SeedDrinkIngredient = SeedRecipeItem & { optional?: boolean };

/** A garnish is always optional by nature, so it has no `optional` flag. */
type SeedDrinkGarnish = SeedRecipeItem;

type SeedDrink = {
	translations: Translations<DrinkTranslation>;
	ingredients: readonly SeedDrinkIngredient[];
	garnishes?: readonly SeedDrinkGarnish[];
};

const exact = (quantity: number, unit = 'milliliter'): SeedExactAmount => ({
	type: DrinkIngredientAmountTypes.exact,
	quantity,
	unit,
});

const drinks = [
	{
		translations: {
			en: {
				name: 'Mojito',
				method: 'In a glass, muddle the mint leaves and lime juice together. Add the rich simple syrup and rum, then fill the glass with ice. Top with sparkling water and stir gently. Garnish with a mint sprig and a lime wedge.',
			},
			pt: {
				name: 'Mojito',
				method: 'Em um copo, macere as folhas de hortelã com o suco de limão. Adicione o xarope enriquecido e o rum, depois encha o copo com gelo. Complete com água com gás e misture suavemente. Decore com um ramo de hortelã e um gomo de limão.',
			},
		},
		ingredients: [
			{ ingredient: 'Silver rum', amount: exact(60) },
			{ ingredient: 'Lime juice', amount: exact(30) },
			{ ingredient: 'Rich simple syrup', amount: exact(30) },
			{ ingredient: 'Mint', amount: exact(8, 'leaf') },
			{
				ingredient: 'Sparkling water',
				amount: { type: DrinkIngredientAmountTypes.qualitative, qualifier: DrinkIngredientQualifiers.topUp },
			},
		],
		// Mint appears again as a garnish; the same ingredient may sit in both lists.
		garnishes: [
			{ ingredient: 'Mint', amount: exact(1, 'sprig') },
			{ ingredient: 'Lime', amount: exact(1, 'wedge') },
		],
	},
	{
		translations: {
			en: {
				name: 'Moscow Mule',
				method: 'Fill a mug with ice. Add the vodka and lime juice, then top with ginger beer. Stir gently. Optionally crown with ginger foam and garnish with a lime wedge.',
			},
			pt: {
				name: 'Moscow Mule',
				method: 'Encha uma caneca com gelo. Adicione a vodka e o suco de limão, depois complete com cerveja de gengibre. Misture suavemente. Opcionalmente, coroe com espuma de gengibre e decore com um gomo de limão.',
			},
		},
		ingredients: [
			{ ingredient: 'Vodka', amount: exact(50) },
			{ ingredient: 'Lime juice', amount: exact(15) },
			{
				ingredient: 'Ginger beer',
				amount: {
					type: DrinkIngredientAmountTypes.qualitative,
					qualifier: DrinkIngredientQualifiers.topUp,
					quantity: 120,
					unit: 'milliliter',
				},
			},
			// Not measurable and optional: the foam is an ingredient, not a decoration.
			{
				ingredient: 'Ginger foam',
				amount: { type: DrinkIngredientAmountTypes.none },
				optional: true,
			},
		],
		garnishes: [{ ingredient: 'Lime', amount: exact(1, 'wedge') }],
	},
	{
		translations: {
			en: {
				name: 'Piña colada',
				method: 'Blend the rum, coconut liqueur, and pineapple juice with ice until smooth. Pour into a chilled glass and garnish with a pineapple slice.',
			},
			pt: {
				name: 'Piña colada',
				method: 'Bata o rum, o licor de coco e o suco de abacaxi com gelo até ficar homogêneo. Despeje em um copo gelado e decore com uma fatia de abacaxi.',
			},
		},
		ingredients: [
			{ ingredient: 'Silver rum', amount: exact(60) },
			{ ingredient: 'Coconut liqueur', amount: exact(30) },
			{ ingredient: 'Pineapple juice', amount: exact(90) },
		],
		garnishes: [{ ingredient: 'Pineapple', amount: exact(1, 'slice') }],
	},
	{
		translations: {
			en: {
				name: 'Sex on the Beach',
				method: 'In a shaker, combine the vodka, peach liqueur, orange juice and ice. Shake well and strain into a glass filled with ice. Add the grenadine and garnish with an orange slice.',
			},
			pt: {
				name: 'Sex on the Beach',
				method: 'Em uma coqueteleira, misture a vodka, o licor de pêssego, o suco de laranja e gelo. Agite bem e coe em um copo cheio de gelo. Adicione o grenadine e decore com uma fatia de laranja.',
			},
		},
		ingredients: [
			{ ingredient: 'Vodka', amount: exact(60) },
			{ ingredient: 'Peach liqueur', amount: exact(30) },
			{ ingredient: 'Orange juice', amount: exact(90) },
			{ ingredient: 'Grenadine', amount: exact(10) },
		],
		garnishes: [{ ingredient: 'Orange', amount: exact(1, 'slice') }],
	},
] as const satisfies readonly SeedDrink[];

/** Resolves a unit English name to the id stored on the already-seeded ingredient that uses it. */
const resolveUnitId = (unitName: string): string => {
	for (const ingredient of ingredientsMap.values()) {
		const unit = ingredient.units.find((candidate) => candidate.translations.en.name === unitName);
		if (unit) return unit.id;
	}
	throw new Error(`Missing seeded unit: ${unitName}`);
};

const resolveIngredientId = (name: string): string => {
	const ingredient = ingredientsMap.get(name as Parameters<typeof ingredientsMap.get>[0]);
	if (!ingredient) throw new Error(`Missing seeded ingredient: ${name}`);
	return ingredient.id;
};

const toAmountInput = (amount: SeedAmount): DrinkIngredientInput['amount'] => {
	switch (amount.type) {
		case DrinkIngredientAmountTypes.exact:
			return { type: amount.type, quantity: amount.quantity, unitId: resolveUnitId(amount.unit) };
		case DrinkIngredientAmountTypes.qualitative:
			return {
				type: amount.type,
				qualifier: amount.qualifier,
				...(amount.quantity === undefined ? {} : { quantity: amount.quantity }),
				...(amount.unit === undefined ? {} : { unitId: resolveUnitId(amount.unit) }),
			};
		case DrinkIngredientAmountTypes.none:
			return { type: amount.type };
	}
};

const toCreateDrink = (drink: SeedDrink): CreateDrinkDTO => ({
	translations: drink.translations,
	ingredients: drink.ingredients.map((line): DrinkIngredientInput => ({
		ingredientId: resolveIngredientId(line.ingredient),
		amount: toAmountInput(line.amount),
		optional: line.optional ?? false,
	})),
	garnishes: (drink.garnishes ?? []).map((line): DrinkGarnishInput => ({
		ingredientId: resolveIngredientId(line.ingredient),
		amount: toAmountInput(line.amount),
	})),
});

export async function insertDrinks() {
	try {
		const service = resolveCreateDrinkService();
		for (const drink of drinks) {
			await service.execute(toCreateDrink(drink));
		}
		logger.info('Drinks inserted successfully');
	} catch (error) {
		logger.error({ err: error }, 'Error inserting drinks');
		throw error;
	}
}
