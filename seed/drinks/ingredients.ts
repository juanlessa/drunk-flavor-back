import { ObjectId } from 'mongodb';
import { IngredientModel, IngredientPersistence } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import {
	INGREDIENT_SEARCH_FIELDS,
	INGREDIENT_SEARCH_OPTIONS,
	buildTranslationsSearchKeys,
} from '@/core/drinks/helpers/searchKeys.helpers';
import { logger } from '@/shared/providers/logger';
import { categoriesMap } from './categories';
import { unitsMap } from './units';

// Seeds omit `kind` (defaults to generic) and may add a description or a brand.
type SeedIngredient = Omit<IngredientPersistence, 'kind'> & Partial<Pick<IngredientPersistence, 'kind'>>;
const ingredients = [
	// Absinthe
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'absinthe' },
			pt: { name: 'absinto' },
		},
		category: categoriesMap.get('Absinthe')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Liqueur
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'amaretto' },
			pt: { name: 'amaretto' },
		},
		category: categoriesMap.get('Liqueur')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'blue curacao', description: 'Orange liqueur colored blue' },
			pt: { name: 'blue curaçao', description: 'Licor de laranja azul' },
		},
		category: categoriesMap.get('Liqueur')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'coconut liqueur' },
			pt: { name: 'batida de coco' },
		},
		category: categoriesMap.get('Liqueur')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'coffee liqueur' },
			pt: { name: 'licor de café' },
		},
		category: categoriesMap.get('Liqueur')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'limoncello' },
			pt: { name: 'limoncello' },
		},
		category: categoriesMap.get('Liqueur')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'peach liqueur' },
			pt: { name: 'licor de pêssego' },
		},
		category: categoriesMap.get('Liqueur')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'triple sec', description: 'Orange liqueur' },
			pt: { name: 'triple sec', description: 'Licor de laranja' },
		},
		category: categoriesMap.get('Liqueur')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Tequila
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'añejo tequila' },
			pt: { name: 'tequila añejo' },
		},
		category: categoriesMap.get('Tequila')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'blanco tequila' },
			pt: { name: 'tequila blanco' },
		},
		category: categoriesMap.get('Tequila')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'reposado tequila' },
			pt: { name: 'tequila reposado' },
		},
		category: categoriesMap.get('Tequila')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Vermouth
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'bianco vermouth' },
			pt: { name: 'vermute bianco' },
		},
		category: categoriesMap.get('Vermouth')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'dry vermouth' },
			pt: { name: 'vermute seco' },
		},
		category: categoriesMap.get('Vermouth')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'rosso vermouth' },
			pt: { name: 'vermute rosso' },
		},
		category: categoriesMap.get('Vermouth')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'sweet vermouth' },
			pt: { name: 'vermute doce' },
		},
		category: categoriesMap.get('Vermouth')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// whisky
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Bourbon whisky' },
			pt: { name: 'whisky bourbon' },
		},
		category: categoriesMap.get('Whisky')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Irish whisky' },
			pt: { name: 'whisky irlandês' },
		},
		category: categoriesMap.get('Whisky')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Japanese whisky' },
			pt: { name: 'whisky japonês' },
		},
		category: categoriesMap.get('Whisky')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Tennessee whiskey' },
			pt: { name: 'whisky Tennessee' },
		},
		category: categoriesMap.get('Whisky')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'whisky' },
			pt: { name: 'whisky' },
		},
		category: categoriesMap.get('Whisky')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Juice
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'lime juice' },
			pt: { name: 'suco de limão' },
		},
		category: categoriesMap.get('Juice')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'orange juice' },
			pt: { name: 'suco de laranja' },
		},
		category: categoriesMap.get('Juice')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'pineapple juice' },
			pt: { name: 'suco de abacaxi' },
		},
		category: categoriesMap.get('Juice')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Mezcal
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'mezcal' },
			pt: { name: 'mezcal' },
		},
		category: categoriesMap.get('Mezcal')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Wine
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'red wine' },
			pt: { name: 'vinho tinto' },
		},
		category: categoriesMap.get('Wine')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'rosé wine' },
			pt: { name: 'vinho rosé' },
		},
		category: categoriesMap.get('Wine')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'white wine' },
			pt: { name: 'vinho branco' },
		},
		category: categoriesMap.get('Wine')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Rum
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'rum' },
			pt: { name: 'rum' },
		},
		category: categoriesMap.get('Rum')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'silver rum' },
			pt: { name: 'rum prata' },
		},
		category: categoriesMap.get('Rum')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Vodka
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'vodka' },
			pt: { name: 'vodka' },
		},
		category: categoriesMap.get('Vodka')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Syrup
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'agave syrup' },
			pt: { name: 'xarope de agave' },
		},
		category: categoriesMap.get('Syrup')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'grenadine', description: 'Pomegranate syrup' },
			pt: { name: 'grenadine', description: 'Xarope de romã' },
		},
		category: categoriesMap.get('Syrup')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},

	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'honey syrup' },
			pt: { name: 'xarope de mel' },
		},
		category: categoriesMap.get('Syrup')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'rich simple syrup' },
			pt: { name: 'xarope enriquecido' },
		},
		category: categoriesMap.get('Syrup')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'simple syrup' },
			pt: { name: 'xarope simples' },
		},
		category: categoriesMap.get('Syrup')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Herb
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'mint' },
			pt: { name: 'hortelã' },
		},
		category: categoriesMap.get('Herb')!,
		unit: unitsMap.get('leaf')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Water
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'coconut water' },
			pt: { name: 'água de coco' },
		},
		category: categoriesMap.get('Water')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'sparkling water' },
			pt: { name: 'água com gás' },
		},
		category: categoriesMap.get('Water')!,
		unit: unitsMap.get('milliliter')!,
		created_at: new Date(),
		updated_at: new Date(),
	},
] as const satisfies readonly SeedIngredient[];

type IngredientEnName = (typeof ingredients)[number]['translations']['en']['name'];

// Mirrors `ingredientNameValidation` (trim, lowercase, capitalize the first letter) so seeded
// names match what the API stores for ingredients created through POST /ingredients.
const normalizeIngredientName = (name: string): string => {
	const lower = name.trim().toLowerCase();
	return `${lower.charAt(0).toLocaleUpperCase()}${lower.slice(1)}`;
};

const toIngredientDocument = (ingredient: SeedIngredient): IngredientPersistence => ({
	...ingredient,
	kind: ingredient.kind ?? 'generic',
	translations: {
		en: { ...ingredient.translations.en, name: normalizeIngredientName(ingredient.translations.en.name) },
		pt: { ...ingredient.translations.pt, name: normalizeIngredientName(ingredient.translations.pt.name) },
	},
});

// Keyed by the raw English name (stable lookup key for drinks.ts); values are the normalized documents.
export const ingredientsMap = new Map<IngredientEnName, IngredientPersistence>(
	ingredients.map<[IngredientEnName, IngredientPersistence]>((ingredient) => [
		ingredient.translations.en.name,
		toIngredientDocument(ingredient),
	]),
);

export async function insertIngredients() {
	try {
		await IngredientModel.insertMany(
			[...ingredientsMap.values()].map((ingredient) => ({
				...ingredient,
				search_keys: buildTranslationsSearchKeys(
					ingredient.translations,
					INGREDIENT_SEARCH_FIELDS,
					[ingredient.brand],
					INGREDIENT_SEARCH_OPTIONS,
				),
			})),
		);
		logger.info('Ingredients inserted successfully');
	} catch (error) {
		logger.error({ err: error }, 'Error inserting ingredients');
		throw error;
	}
}
