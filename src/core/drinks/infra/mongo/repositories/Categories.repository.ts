import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { Category } from '@/core/drinks/entities/category.entity';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { CategoryModel } from '../entities/category.model';
import { getNameCompareQuery } from '../helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';

export class CategoriesRepository implements ICategoriesRepository {
	async create(data: CreateCategory): Promise<Category> {
		return CategoryModel.create(data);
	}
	async update({ id, ...data }: UpdateCategory): Promise<Category> {
		const category = await CategoryModel.findByIdAndUpdate<Category>(id, data, { new: true }).exec();
		if (!category) {
			throw new NotFoundError('apiResponses.categories.notFound', {
				path: 'Categories.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		return category;
	}

	async delete(id: string): Promise<Category> {
		const category = await CategoryModel.findByIdAndDelete<Category>(id).exec();
		if (!category) {
			throw new NotFoundError('apiResponses.categories.notFound', {
				path: 'Categories.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return category;
	}

	async findByName(data: FindCategoryByName): Promise<Category | null> {
		return CategoryModel.findOne<Category>({ $or: getNameCompareQuery(data) })
			.lean<Category>({ transform: removeLeanVersionKey })
			.exec();
	}

	async findById(id: string): Promise<Category | null> {
		return CategoryModel.findById<Category>(id).lean<Category>({ transform: removeLeanVersionKey }).exec();
	}

	async findAll(query: QueryParams): Promise<Category[]> {
		const mongooseQuery = buildQuery<Category[]>(query, CategoryModel);
		return mongooseQuery.lean({ transform: removeLeanVersionKey }).exec();
	}
}
