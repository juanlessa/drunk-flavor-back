import { ObjectId } from 'mongodb';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { logger } from '@/shared/logger';
import { categoriesMap } from './categories';

const ingredients = [
	// Absinthe
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'absinthe', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'absinto', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Absinthe')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Liqueur
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'amaretto', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'amaretto', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Liqueur')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'blue curacao', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'blue curaçao', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Liqueur')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'coconut liqueur', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'batida de coco', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Liqueur')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'coffee liqueur', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'licor de café', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Liqueur')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'limoncello', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'limoncello', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Liqueur')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'peach liqueur', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'licor de pêssego', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Liqueur')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'triple sec', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'triple sec', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Liqueur')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Tequila
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'añejo tequila', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'tequila añejo', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Tequila')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'blanco tequila', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'tequila blanco', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Tequila')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'reposado tequila', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'tequila reposado', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Tequila')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Vermouth
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'bianco vermouth', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'vermute bianco', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Vermouth')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'dry vermouth', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'vermute seco', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Vermouth')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'rosso vermouth', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'vermute rosso', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Vermouth')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'sweet vermouth', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'vermute doce', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Vermouth')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// whisky
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Bourbon whisky', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'whisky bourbon', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Whisky')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Irish whisky', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'whisky irlandês', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Whisky')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Japanese whisky', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'whisky japonês', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Whisky')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Tennessee whiskey', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'whisky Tennessee', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Whisky')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'whisky', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'whisky', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Whisky')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Juice
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'lime juice', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'suco de limão', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Juice')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'orange juice', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'suco de laranja', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Juice')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'pineapple juice', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'suco de abacaxi', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Juice')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Mezcal
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'mezcal', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'mezcal', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Mezcal')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Wine
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'red wine', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'vinho tinto', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Wine')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'rosé wine', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'vinho rosé', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Wine')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'white wine', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'vinho branco', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Wine')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Rum
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'rum', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'rum', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Rum')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'silver rum', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'rum prata', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Rum')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Vodka
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'vodka', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'vodka', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Vodka')!,
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Syrup
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'agave syrup', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'xarope de agave', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Syrup')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'grenadine', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'grenadine', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Syrup')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},

	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'honey syrup', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'xarope de mel', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Syrup')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'rich simple syrup', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'xarope enriquecido', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Syrup')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'simple syrup', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'xarope simples', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Syrup')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Herb
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'mint', unit: 'leaf', unit_plural: 'leaves' },
			pt: { name: 'hortelã', unit: 'folha', unit_plural: 'folhas' },
		},
		category: categoriesMap.get('Herb')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	// Water
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'coconut water', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'água de coco', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Water')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'sparkling water', unit: 'ml', unit_plural: 'ml' },
			pt: { name: 'água com gás', unit: 'ml', unit_plural: 'ml' },
		},
		category: categoriesMap.get('Water')!,
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
] as const satisfies readonly Ingredient[];

type IngredientEnName = (typeof ingredients)[number]['translations']['en']['name'];

export const ingredientsMap = new Map<IngredientEnName, Ingredient>(
	ingredients.map<[IngredientEnName, Ingredient]>((ingredient) => [ingredient.translations.en.name, ingredient]),
);

export async function insertIngredients() {
	try {
		await IngredientModel.insertMany(ingredients);
		logger.info('Ingredients inserted successfully');
	} catch (error) {
		logger.error('Error inserting ingredients:', error);
		throw error;
	}
}
