import { CreateIngredientCommand } from '@/core/drinks/useCases/ingredients/create/createIngredient.dtos';
import { resolveCreateIngredientService } from '@/core/drinks/useCases/ingredients/create/createIngredient.container';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { logger } from '@/shared/providers/logger';
import { categoriesMap } from './categories';
import { unitsMap } from './units';

/**
 * Seed ingredients described by category and unit English names. The names are resolved to ids
 * from the created categories/units when the seed runs. `units` lists the allowed units in display
 * order; an empty list means the ingredient is not measurable (e.g. a foam).
 */
type SeedIngredient = {
	translations: CreateIngredientCommand['translations'];
	category: string;
	units: readonly string[];
	kind?: CreateIngredientCommand['kind'];
	brand?: string;
};

const ingredients = [
	{
		translations: { en: { name: 'Cachaça' }, pt: { name: 'Cachaça', gender: 'feminine' } },
		category: 'Cachaça',
		units: ['milliliter'],
	},
	{
		translations: {
			en: { name: 'Gabriela cachaça (clove and cinnamon)' },
			pt: { name: 'Cachaça gabriela (cravo e canela)', gender: 'feminine' },
		},
		category: 'Cachaça',
		units: ['milliliter'],
		kind: 'branded',
		brand: 'Gabriela',
	},
	{
		translations: { en: { name: 'Espresso' }, pt: { name: 'Café expresso', gender: 'masculine' } },
		category: 'Coffee',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Gin' }, pt: { name: 'Gin', gender: 'masculine' } },
		category: 'Gin',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Mint' }, pt: { name: 'Hortelã', gender: 'feminine' } },
		category: 'Herb',
		units: ['leaf', 'sprig'],
	},
	{
		translations: { en: { name: 'Basil' }, pt: { name: 'Manjericão', gender: 'masculine' } },
		category: 'Herb',
		units: ['leaf'],
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
		translations: {
			en: { name: 'Licor 43', description: 'Spanish vanilla and citrus liqueur' },
			pt: { name: 'Licor 43', gender: 'masculine', description: 'Licor espanhol de baunilha e frutas cítricas' },
		},
		category: 'Liqueur',
		units: ['milliliter'],
		kind: 'branded',
		brand: 'Licor 43',
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
	{
		translations: { en: { name: 'Passion fruit purée' }, pt: { name: 'Polpa de maracujá', gender: 'feminine' } },
		category: 'Pulp',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Rum' }, pt: { name: 'Rum', gender: 'masculine' } },
		category: 'Rum',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Sake' }, pt: { name: 'Saquê', gender: 'masculine' } },
		category: 'Sake',
		units: ['milliliter'],
	},
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
	{
		translations: { en: { name: 'Watermelon juice' }, pt: { name: 'Suco de melancia', gender: 'masculine' } },
		category: 'Juice',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Tequila' }, pt: { name: 'Tequila', gender: 'feminine' } },
		category: 'Tequila',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Vodka' }, pt: { name: 'Vodka', gender: 'feminine' } },
		category: 'Vodka',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Whisky' }, pt: { name: 'Whisky', gender: 'masculine' } },
		category: 'Whisky',
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
		translations: { en: { name: 'Simple syrup' }, pt: { name: 'Xarope simples', gender: 'masculine' } },
		category: 'Syrup',
		units: ['milliliter'],
	},
	{
		translations: { en: { name: 'Tonic water' }, pt: { name: 'Água tônica', gender: 'feminine' } },
		category: 'Soft drink',
		units: ['milliliter'],
	},
	// Garnishes and finishing touches used by the preparation plans.
	{
		translations: { en: { name: 'Lime' }, pt: { name: 'Limão', gender: 'masculine' } },
		category: 'Fruit',
		units: ['wedge', 'slice'],
	},
	{
		translations: { en: { name: 'Watermelon' }, pt: { name: 'Melancia', gender: 'feminine' } },
		category: 'Fruit',
		units: ['wedge'],
	},
	{
		translations: { en: { name: 'Cherry' }, pt: { name: 'Cereja', gender: 'feminine' } },
		category: 'Fruit',
		units: [],
	},
	{
		translations: { en: { name: 'Passion fruit' }, pt: { name: 'Maracujá', gender: 'masculine' } },
		category: 'Fruit',
		units: [],
	},
	{
		translations: {
			en: { name: 'Chili salt', description: 'Salt mixed with chili powder' },
			pt: { name: 'Sal com chili', gender: 'masculine', description: 'Sal misturado com pimenta chili em pó' },
		},
		category: 'Spice',
		units: ['gram'],
	},
] as const satisfies readonly SeedIngredient[];

type IngredientEnName = (typeof ingredients)[number]['translations']['en']['name'];

/** Created ingredients keyed by their raw English name, for drinks.ts to reference. */
export const ingredientsMap = new Map<IngredientEnName, Ingredient>();

export async function insertIngredients(actor: Actor) {
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
				actor,
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
