import { ObjectId } from 'mongodb';
import { Category } from '@/core/drinks/entities/category.entity';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { logger } from '@/shared/providers/logger';

const categories = [
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Absinthe' },
			pt: { name: 'Absinto' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Amaro' },
			pt: { name: 'Amaro' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Bitter' },
			pt: { name: 'Bitter' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Cachaça' },
			pt: { name: 'Cachaça' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Coffee' },
			pt: { name: 'Café' },
		},
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Gin' },
			pt: { name: 'Gin' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Herb' },
			pt: { name: 'Erva' },
		},
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Juice' },
			pt: { name: 'Suco' },
		},
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Liqueur' },
			pt: { name: 'Licor' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Mezcal' },
			pt: { name: 'Mezcal' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Rum' },
			pt: { name: 'Rum' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Sake' },
			pt: { name: 'Saquê' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Spice' },
			pt: { name: 'Especiaria' },
		},
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Syrup' },
			pt: { name: 'Xarope' },
		},
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Tea' },
			pt: { name: 'Chá' },
		},
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Tequila' },
			pt: { name: 'Tequila' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Vermouth' },
			pt: { name: 'Vermute' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Vodka' },
			pt: { name: 'Vodka' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Water' },
			pt: { name: 'Água' },
		},
		is_alcoholic: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Whisky' },
			pt: { name: 'Whisky' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Wine' },
			pt: { name: 'Vinho' },
		},
		is_alcoholic: true,
		created_at: new Date(),
		updated_at: new Date(),
	},
] as const satisfies readonly Category[];

type CategoryEnName = (typeof categories)[number]['translations']['en']['name'];

export const categoriesMap = new Map<CategoryEnName, Category>(
	categories.map<[CategoryEnName, Category]>((category) => [category.translations.en.name, category]),
);

export async function insertCategories() {
	try {
		await CategoryModel.insertMany(categories);
		logger.info('Categories inserted successfully');
	} catch (error) {
		logger.error({ err: error }, 'Error inserting categories');
		throw error;
	}
}
