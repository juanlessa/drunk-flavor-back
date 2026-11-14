import { CreateDrinkCommand } from '@/core/drinks/useCases/drinks/create/createDrink.dtos';
import { resolveCreateDrinkService } from '@/core/drinks/useCases/drinks/create/createDrink.container';
import { DrinkGarnishInput, DrinkIngredientInput } from '@/core/drinks/dtos/drink.dtos';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
import { Actor } from '@/shared/accessControl/actor.types';
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
type SeedNoneAmount = { type: typeof DrinkIngredientAmountTypes.none };
type SeedAmount = SeedExactAmount | SeedNoneAmount;

type SeedRecipeItem = {
	ingredient: string;
	amount: SeedAmount;
};
type SeedDrinkIngredient = SeedRecipeItem & { optional?: boolean };
/** A garnish is always optional by nature, so it has no `optional` flag. */
type SeedDrinkGarnish = SeedRecipeItem;

/** A reference to a recipe line from a preparation plan, by English names; resolved to ids when the seed runs. */
type SeedRef = {
	list: 'ingredients' | 'garnishes';
	ingredient: string;
	unit?: string;
	withUnit?: boolean;
};

/** The preparation plan with every reference to a recipe line written as a `SeedRef`. */
type WithSeedRefs<T> = T extends { list: string; ingredientId: string }
	? SeedRef
	: T extends (infer Item)[]
		? WithSeedRefs<Item>[]
		: T extends object
			? { [Key in keyof T]: WithSeedRefs<T[Key]> }
			: T;
type SeedPlan = WithSeedRefs<PreparationPlan>;

type SeedDrink = {
	names: { en: string; pt: string };
	ingredients: readonly SeedDrinkIngredient[];
	garnishes?: readonly SeedDrinkGarnish[];
	/** The method of both languages is written from the plan. */
	preparation: SeedPlan;
};

const exact = (quantity: number, unit = 'milliliter'): SeedExactAmount => ({
	type: DrinkIngredientAmountTypes.exact,
	quantity,
	unit,
});
const none: SeedNoneAmount = { type: DrinkIngredientAmountTypes.none };

// Plan helpers: the recipe lines of these drinks are measured in milliliters unless said otherwise.
const ml = (ingredient: string): SeedRef => ({ list: 'ingredients', ingredient, unit: 'milliliter' });
const leaves = (ingredient: string): SeedRef => ({ list: 'ingredients', ingredient, unit: 'leaf', withUnit: true });
const garnish = (ingredient: string, unit?: string): SeedRef => ({
	list: 'garnishes',
	ingredient,
	...(unit === undefined ? {} : { unit, withUnit: true }),
});

const SHAKE_SECONDS = 15;

const drinks: readonly SeedDrink[] = [
	{
		names: { en: 'Carajillo', pt: 'Carajillo' },
		ingredients: [
			{ ingredient: 'Licor 43', amount: exact(75) },
			{ ingredient: 'Espresso', amount: exact(75) },
		],
		preparation: {
			mixingVessel: 'shaker',
			servingGlass: 'rocks',
			actions: [
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'add', target: 'mixing', items: [ml('Licor 43'), ml('Espresso')] },
				{ type: 'shake', intensity: 'vigorous', seconds: SHAKE_SECONDS },
				{ type: 'add_ice', target: 'serving', kind: 'cubes' },
				{ type: 'strain', kind: 'single', overIce: true },
				{
					type: 'custom',
					text: {
						en: 'Let the foam settle on top before serving.',
						pt: 'Deixe a espuma assentar no topo antes de servir.',
					},
				},
			],
		},
	},
	{
		names: { en: 'Basil smash', pt: 'Basil smash' },
		ingredients: [
			{ ingredient: 'Gin', amount: exact(60) },
			{ ingredient: 'Lime juice', amount: exact(25) },
			{ ingredient: 'Simple syrup', amount: exact(20) },
			{ ingredient: 'Basil', amount: exact(10, 'leaf') },
			{ ingredient: 'Tonic water', amount: exact(107) },
		],
		garnishes: [{ ingredient: 'Basil', amount: exact(3, 'leaf') }],
		preparation: {
			mixingVessel: 'shaker',
			servingGlass: 'highball',
			actions: [
				{ type: 'add', target: 'mixing', items: [leaves('Basil'), ml('Lime juice')] },
				{ type: 'muddle', intensity: 'gentle' },
				{ type: 'add', target: 'mixing', items: [ml('Gin'), ml('Simple syrup')] },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'shake', intensity: 'vigorous', seconds: SHAKE_SECONDS },
				{ type: 'add_ice', target: 'serving', kind: 'cubes' },
				{ type: 'strain', kind: 'double', overIce: true },
				{ type: 'top', item: ml('Tonic water') },
				{
					type: 'custom',
					text: {
						en: 'Gently stir from bottom to top to combine.',
						pt: 'Mexa gentilmente de baixo para cima para integrar.',
					},
				},
				{ type: 'garnish', items: [garnish('Basil', 'leaf')] },
			],
		},
	},
	{
		names: { en: 'Jorge amado', pt: 'Jorge amado' },
		ingredients: [
			{ ingredient: 'Gabriela cachaça (clove and cinnamon)', amount: exact(60) },
			{ ingredient: 'Passion fruit purée', amount: exact(40) },
			{ ingredient: 'Lime juice', amount: exact(20) },
			{ ingredient: 'Simple syrup', amount: exact(10) },
		],
		garnishes: [{ ingredient: 'Lime', amount: exact(1, 'wedge') }],
		preparation: {
			mixingVessel: 'shaker',
			servingGlass: 'rocks',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [
						ml('Passion fruit purée'),
						ml('Lime juice'),
						ml('Simple syrup'),
						ml('Gabriela cachaça (clove and cinnamon)'),
					],
				},
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'shake', intensity: 'vigorous', seconds: SHAKE_SECONDS },
				// Poured whole, seeds included, without a strainer.
				{ type: 'strain', kind: 'none' },
				{ type: 'garnish', items: [garnish('Lime', 'wedge')], style: 'rim_perch' },
			],
		},
	},
	{
		names: { en: 'Sex on the beach', pt: 'Sex on the beach' },
		ingredients: [
			{ ingredient: 'Vodka', amount: exact(60) },
			{ ingredient: 'Peach liqueur', amount: exact(30) },
			{ ingredient: 'Orange juice', amount: exact(90) },
			{ ingredient: 'Grenadine', amount: exact(10) },
		],
		garnishes: [
			{ ingredient: 'Cherry', amount: none },
			{ ingredient: 'Mint', amount: exact(1, 'sprig') },
		],
		preparation: {
			// Built in the glass.
			mixingVessel: 'serving_glass',
			servingGlass: 'hurricane',
			actions: [
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'add', target: 'mixing', items: [ml('Vodka'), ml('Peach liqueur'), ml('Orange juice')] },
				{ type: 'stir', intensity: 'gentle' },
				{
					type: 'custom',
					items: [ml('Grenadine')],
					into: 'serving',
					text: {
						en: 'Slowly pour the grenadine down the inside wall of the glass or over the back of a bar spoon, so it sinks to the bottom and forms the layered gradient.',
						pt: 'Despeje o grenadine lentamente pelas laterais do copo ou pelo dorso da colher de bar, para que ele desça até o fundo e forme o gradiente em camadas.',
					},
				},
				{ type: 'garnish', items: [garnish('Cherry'), garnish('Mint', 'sprig')] },
			],
		},
	},
	{
		names: { en: 'Passion fruit margarita', pt: 'Margarita de maracujá' },
		ingredients: [
			{ ingredient: 'Tequila', amount: exact(50) },
			{ ingredient: 'Triple sec', amount: exact(25) },
			{ ingredient: 'Passion fruit purée', amount: exact(30) },
			{ ingredient: 'Lime juice', amount: exact(20) },
			{ ingredient: 'Simple syrup', amount: exact(10) },
		],
		garnishes: [
			{ ingredient: 'Chili salt', amount: none },
			{ ingredient: 'Passion fruit', amount: none },
		],
		preparation: {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [
						ml('Tequila'),
						ml('Triple sec'),
						ml('Passion fruit purée'),
						ml('Lime juice'),
						ml('Simple syrup'),
					],
				},
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'shake', intensity: 'vigorous', seconds: SHAKE_SECONDS },
				{ type: 'prepare_glass', mode: 'rim', item: garnish('Chili salt'), coverage: 'half' },
				{ type: 'add_ice', target: 'serving', kind: 'cubes' },
				{ type: 'strain', kind: 'single', overIce: true },
				{
					type: 'custom',
					items: [garnish('Passion fruit')],
					into: 'serving',
					text: {
						en: 'Finish by placing half a fresh passion fruit on top.',
						pt: 'Finalize apoiando meio maracujá fresco por cima.',
					},
				},
			],
		},
	},
	{
		names: { en: 'Watermelon kiss', pt: 'Watermelon kiss' },
		ingredients: [
			{ ingredient: 'Tequila', amount: exact(50) },
			{ ingredient: 'Limoncello', amount: exact(30) },
			{ ingredient: 'Watermelon juice', amount: exact(90) },
			{ ingredient: 'Simple syrup', amount: exact(10) },
		],
		garnishes: [
			{ ingredient: 'Watermelon', amount: exact(1, 'wedge') },
			{ ingredient: 'Mint', amount: exact(1, 'sprig') },
		],
		preparation: {
			mixingVessel: 'shaker',
			servingGlass: 'highball',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [ml('Tequila'), ml('Limoncello'), ml('Watermelon juice'), ml('Simple syrup')],
				},
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'shake', intensity: 'vigorous', seconds: SHAKE_SECONDS },
				{ type: 'add_ice', target: 'serving', kind: 'cubes' },
				{ type: 'strain', kind: 'double', overIce: true },
				{ type: 'garnish', items: [garnish('Watermelon', 'wedge')], style: 'rim_perch' },
				{ type: 'garnish', items: [garnish('Mint', 'sprig')] },
			],
		},
	},
];

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
		case DrinkIngredientAmountTypes.none:
			return { type: amount.type };
	}
};

const isSeedRef = (value: unknown): value is SeedRef =>
	typeof value === 'object' && value !== null && 'list' in value && 'ingredient' in value;

/** Replaces every `SeedRef` of a plan (at any depth) by a reference made of ids. */
const resolvePlanRefs = (value: unknown): unknown => {
	if (isSeedRef(value)) {
		return {
			list: value.list,
			ingredientId: resolveIngredientId(value.ingredient),
			...(value.unit === undefined ? {} : { unitId: resolveUnitId(value.unit) }),
			...(value.withUnit === undefined ? {} : { withUnit: value.withUnit }),
		};
	}
	if (Array.isArray(value)) return value.map(resolvePlanRefs);
	if (typeof value === 'object' && value !== null) {
		return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolvePlanRefs(entry)]));
	}
	return value;
};

const toCreateDrink = (drink: SeedDrink): Omit<CreateDrinkCommand, 'actor'> => ({
	translations: { en: { name: drink.names.en }, pt: { name: drink.names.pt } },
	ingredients: drink.ingredients.map((line): DrinkIngredientInput => ({
		ingredientId: resolveIngredientId(line.ingredient),
		amount: toAmountInput(line.amount),
		optional: line.optional ?? false,
	})),
	garnishes: (drink.garnishes ?? []).map((line): DrinkGarnishInput => ({
		ingredientId: resolveIngredientId(line.ingredient),
		amount: toAmountInput(line.amount),
	})),
	preparation: resolvePlanRefs(drink.preparation) as PreparationPlan,
});

export async function insertDrinks(actor: Actor) {
	try {
		const service = resolveCreateDrinkService();
		for (const drink of drinks) {
			await service.execute({ ...toCreateDrink(drink), actor });
		}
		logger.info('Drinks inserted successfully');
	} catch (error) {
		logger.error({ err: error }, 'Error inserting drinks');
		throw error;
	}
}
