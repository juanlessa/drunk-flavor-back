import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { Category } from '@/core/drinks/entities/category.entity';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { CategoryModel } from '../entities/category.model';
import { getNameCompareQuery } from '../helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { CATEGORY_MESSAGES } from '@/core/drinks/constants/categories.constants';
import { QueryParams } from '@/shared/types/query.types';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';

export class CategoriesRepository implements ICategoriesRepository {
	async create(data: CreateCategory): Promise<Category> {
		return CategoryModel.create(data);
	}
	async update({ id, ...data }: UpdateCategory): Promise<Category> {
		const category = await CategoryModel.findByIdAndUpdate<Category>(id, data, { new: true }).exec();
		if (!category) {
			throw new NotFoundError(CATEGORY_MESSAGES.notFound.message, {
				path: 'Categories.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		return category;
	}

	async delete(id: string): Promise<Category> {
		const category = await CategoryModel.findByIdAndDelete<Category>(id).exec();
		if (!category) {
			throw new NotFoundError(CATEGORY_MESSAGES.notFound.message, {
				path: 'Categories.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return category;
	}

	async findByName(data: FindCategoryByName): Promise<Category | null> {
		return CategoryModel.findOne<Category>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<Category | null> {
		return CategoryModel.findById<Category>(id).exec();
	}

	async findAll(query: QueryParams): Promise<Category[]> {
		const mongooseQuery = buildQuery(query, CategoryModel);
		return mongooseQuery.exec();
	}
}
