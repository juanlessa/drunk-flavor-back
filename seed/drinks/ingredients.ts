import { CreateIngredientDTO } from '@/core/drinks/useCases/ingredients/create/createIngredient.dtos';
import { resolveCreateIngredientService } from '@/core/drinks/useCases/ingredients/create/createIngredient.container';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { logger } from '@/shared/providers/logger';
import { categoriesMap } from './categories';
import { unitsMap } from './units';

/**
 * Seed ingredients described by category and unit English names. The names are resolved to ids
 * from the created categories/units when the seed runs. `units` lists the allowed units in display
 * order; an empty list means the ingredient is not measurable (e.g. a foam).
 */
type SeedIngredient = {
	translations: CreateIngredientDTO['translations'];
	category: string;
	units: readonly string[];
	kind?: CreateIngredientDTO['kind'];
	brand?: string;
};

const ingredients = [
	// Absinthe
	{
		translations: { en: { name: 'Absinthe' }, pt: { name: 'Absinto', gender: 'masculine' } },
		category: 'Absinthe',
		units: ['milliliter'],
	},
	// Liqueur
	{
		translations: { en: { name: 'Amaretto' }, pt: { name: 'Amaretto', gender: 'masculine' } },
		category: 'Liqueur',
		units: ['milliliter'],
	},
	{
		translations: {
			en: { name: 'Blue curacao', description: 'Orange liqueur colored blue' },
			pt: { name: 'Blue curaçao', gender: 'masculine', description: 'Licor de laranja azul' },
		},
		category: 'Liqueur',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Coconut liqueur' }, pt: { name: 'Batida de coco', gender: 'feminine' } },
		category: 'Liqueur',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Coffee liqueur' }, pt: { name: 'Licor de café', gender: 'masculine' } },
		category: 'Liqueur',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Limoncello' }, pt: { name: 'Limoncello', gender: 'masculine' } },
		category: 'Liqueur',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Peach liqueur' }, pt: { name: 'Licor de pêssego', gender: 'masculine' } },
		category: 'Liqueur',
		units: ['milliliter'],
	},
	{
		translations: {
			en: { name: 'Triple sec', description: 'Orange liqueur' },
			pt: { name: 'Triple sec', gender: 'masculine', description: 'Licor de laranja' },
		},
		category: 'Liqueur',
		units: ['milliliter'],
	},
	// A branded ingredient example: the recipe needs this specific product.
	{
		translations: {
			en: { name: 'Licor 43', description: 'Spanish vanilla and citrus liqueur' },
			pt: { name: 'Licor 43', gender: 'masculine', description: 'Licor espanhol de baunilha e frutas cítricas' },
		},
		category: 'Liqueur',
		units: ['milliliter'],
		kind: 'branded',
		brand: 'Licor 43',
	},
	// Tequila
	{
		translations: { en: { name: 'Añejo tequila' }, pt: { name: 'Tequila añejo', gender: 'feminine' } },
		category: 'Tequila',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Blanco tequila' }, pt: { name: 'Tequila blanco', gender: 'feminine' } },
		category: 'Tequila',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Reposado tequila' }, pt: { name: 'Tequila reposado', gender: 'feminine' } },
		category: 'Tequila',
		units: ['milliliter'],
	},
	// Vermouth
	{
		translations: { en: { name: 'Bianco vermouth' }, pt: { name: 'Vermute bianco', gender: 'masculine' } },
		category: 'Vermouth',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Dry vermouth' }, pt: { name: 'Vermute seco', gender: 'masculine' } },
		category: 'Vermouth',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Rosso vermouth' }, pt: { name: 'Vermute rosso', gender: 'masculine' } },
		category: 'Vermouth',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Sweet vermouth' }, pt: { name: 'Vermute doce', gender: 'masculine' } },
		category: 'Vermouth',
		units: ['milliliter'],
	},
	// Whisky
	{
		translations: { en: { name: 'Bourbon whisky' }, pt: { name: 'Whisky bourbon', gender: 'masculine' } },
		category: 'Whisky',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Irish whisky' }, pt: { name: 'Whisky irlandês', gender: 'masculine' } },
		category: 'Whisky',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Japanese whisky' }, pt: { name: 'Whisky japonês', gender: 'masculine' } },
		category: 'Whisky',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Tennessee whiskey' }, pt: { name: 'Whisky tennessee', gender: 'masculine' } },
		category: 'Whisky',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Whisky' }, pt: { name: 'Whisky', gender: 'masculine' } },
		category: 'Whisky',
		units: ['milliliter'],
	},
	// Juice
	{
		translations: { en: { name: 'Lime juice' }, pt: { name: 'Suco de limão', gender: 'masculine' } },
		category: 'Juice',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Orange juice' }, pt: { name: 'Suco de laranja', gender: 'masculine' } },
		category: 'Juice',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Pineapple juice' }, pt: { name: 'Suco de abacaxi', gender: 'masculine' } },
		category: 'Juice',
		units: ['milliliter'],
	},
	// Fruit (whole fruit used as slices or wedges, mostly as garnish)
	{
		translations: { en: { name: 'Lime' }, pt: { name: 'Limão', gender: 'masculine' } },
		category: 'Fruit',
		units: ['slice', 'wedge'],
	},
	{
		translations: { en: { name: 'Orange' }, pt: { name: 'Laranja', gender: 'feminine' } },
		category: 'Fruit',
		units: ['slice', 'wedge', 'twist'],
	},
	{
		translations: { en: { name: 'Pineapple' }, pt: { name: 'Abacaxi', gender: 'masculine' } },
		category: 'Fruit',
		units: ['slice'],
	},
	// Mezcal
	{
		translations: { en: { name: 'Mezcal' }, pt: { name: 'Mezcal', gender: 'masculine' } },
		category: 'Mezcal',
		units: ['milliliter'],
	},
	// Wine
	{
		translations: { en: { name: 'Red wine' }, pt: { name: 'Vinho tinto', gender: 'masculine' } },
		category: 'Wine',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Rosé wine' }, pt: { name: 'Vinho rosé', gender: 'masculine' } },
		category: 'Wine',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'White wine' }, pt: { name: 'Vinho branco', gender: 'masculine' } },
		category: 'Wine',
		units: ['milliliter'],
	},
	// Rum
	{
		translations: { en: { name: 'Rum' }, pt: { name: 'Rum', gender: 'masculine' } },
		category: 'Rum',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Silver rum' }, pt: { name: 'Rum prata', gender: 'masculine' } },
		category: 'Rum',
		units: ['milliliter'],
	},
	// Vodka
	{
		translations: { en: { name: 'Vodka' }, pt: { name: 'Vodka', gender: 'feminine' } },
		category: 'Vodka',
		units: ['milliliter'],
	},
	// Syrup
	{
		translations: { en: { name: 'Agave syrup' }, pt: { name: 'Xarope de agave', gender: 'masculine' } },
		category: 'Syrup',
		units: ['milliliter'],
	},
	{
		translations: {
			en: { name: 'Grenadine', description: 'Pomegranate syrup' },
			pt: { name: 'Grenadine', gender: 'masculine', description: 'Xarope de romã' },
		},
		category: 'Syrup',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Honey syrup' }, pt: { name: 'Xarope de mel', gender: 'masculine' } },
		category: 'Syrup',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Rich simple syrup' }, pt: { name: 'Xarope enriquecido', gender: 'masculine' } },
		category: 'Syrup',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Simple syrup' }, pt: { name: 'Xarope simples', gender: 'masculine' } },
		category: 'Syrup',
		units: ['milliliter'],
	},
	// Herb
	{
		translations: { en: { name: 'Mint' }, pt: { name: 'Hortelã', gender: 'feminine' } },
		category: 'Herb',
		units: ['leaf', 'sprig'],
	},
	// Soda
	{
		translations: { en: { name: 'Ginger beer' }, pt: { name: 'Cerveja de gengibre', gender: 'feminine' } },
		category: 'Soda',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Tonic water' }, pt: { name: 'Água tônica', gender: 'feminine' } },
		category: 'Soda',
		units: ['milliliter'],
	},
	// Water
	{
		translations: { en: { name: 'Coconut water' }, pt: { name: 'Água de coco', gender: 'feminine' } },
		category: 'Water',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Sparkling water' }, pt: { name: 'Água com gás', gender: 'feminine' } },
		category: 'Water',
		units: ['milliliter'],
	},
	// Foam (not measurable: no units)
	{
		translations: {
			en: { name: 'Ginger foam', description: 'Airy ginger foam' },
			pt: { name: 'Espuma de gengibre', gender: 'feminine', description: 'Espuma aerada de gengibre' },
		},
		category: 'Foam',
		units: [],
	},
] as const satisfies readonly SeedIngredient[];

type IngredientEnName = (typeof ingredients)[number]['translations']['en']['name'];

/** Created ingredients keyed by their raw English name, for drinks.ts to reference. */
export const ingredientsMap = new Map<IngredientEnName, Ingredient>();

export async function insertIngredients() {
	try {
		const service = resolveCreateIngredientService();
		for (const ingredient of ingredients) {
			const category = categoriesMap.get(ingredient.category);
			if (!category) throw new Error(`Missing seeded category: ${ingredient.category}`);
			const unitIds = ingredient.units.map((unitName) => {
				const unit = unitsMap.get(unitName);
				if (!unit) throw new Error(`Missing seeded unit: ${unitName}`);
				return unit.id;
			});
			const created = await service.execute({
				translations: ingredient.translations,
				categoryId: category.id,
				unitIds,
				...('kind' in ingredient ? { kind: ingredient.kind } : {}),
				...('brand' in ingredient ? { brand: ingredient.brand } : {}),
			});
			ingredientsMap.set(ingredient.translations.en.name, created);
		}
		logger.info('Ingredients inserted successfully');
	} catch (error) {
		logger.error({ err: error }, 'Error inserting ingredients');
		throw error;
	}
}
