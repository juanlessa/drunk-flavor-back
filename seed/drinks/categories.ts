import { ObjectId } from 'mongodb';
import { Category } from '@/core/drinks/entities/category.entity';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { logger } from '@/shared/logger';

const categories = [
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Absinthe' },
			pt: { name: 'Absinto' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Amaro' },
			pt: { name: 'Amaro' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Bitter' },
			pt: { name: 'Bitter' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Cachaça' },
			pt: { name: 'Cachaça' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Coffee' },
			pt: { name: 'Café' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Gin' },
			pt: { name: 'Gin' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Herb' },
			pt: { name: 'Erva' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Juice' },
			pt: { name: 'Suco' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Liqueur' },
			pt: { name: 'Licor' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Mezcal' },
			pt: { name: 'Mezcal' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Rum' },
			pt: { name: 'Rum' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Sake' },
			pt: { name: 'Saquê' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Spice' },
			pt: { name: 'Especiaria' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Syrup' },
			pt: { name: 'Xarope' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Tea' },
			pt: { name: 'Chá' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Tequila' },
			pt: { name: 'Tequila' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Vermouth' },
			pt: { name: 'Vermute' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Vodka' },
			pt: { name: 'Vodka' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Water' },
			pt: { name: 'Água' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Whisky' },
			pt: { name: 'Whisky' },
		},
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'Wine' },
			pt: { name: 'Vinho' },
		},
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
		logger.error('Error inserting categories:', error);
		throw error;
	}
}
