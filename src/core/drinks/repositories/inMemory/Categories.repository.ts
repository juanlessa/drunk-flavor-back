import { Category } from '@/core/drinks/entities/category.entity';
import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { ObjectId } from 'mongodb';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helpers';
import { CATEGORY_MESSAGES } from '@/core/drinks/constants/categories.constants';
import { QueryParams } from '@/shared/types/query.types';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';

export class CategoriesRepositoryInMemory implements ICategoriesRepository {
	categories: Category[] = [];

	async create({ translations }: CreateCategory): Promise<Category> {
		const category: Category = {
			_id: new ObjectId(),
			translations,
			created_at: new Date(),
			updated_at: new Date(),
		};

		this.categories.push(category);
		return category;
	}

	async update({ id, ...data }: UpdateCategory): Promise<Category> {
		const categoryIndex = this.categories.findIndex((cat) => cat._id.toString() === id);
		if (categoryIndex === -1) {
			throw new NotFoundError(CATEGORY_MESSAGES.notFound.message, {
				path: 'CategoriesInMemory.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		let category = this.categories[categoryIndex];
		category = deepUpdate<Category>(data, category);
		category.updated_at = new Date();

		this.categories[categoryIndex] = category;
		return category;
	}

	async delete(id: string): Promise<Category> {
		const categoryIndex = this.categories.findIndex((cat) => cat._id.toString() === id);
		if (categoryIndex === -1) {
			throw new NotFoundError(CATEGORY_MESSAGES.notFound.message, {
				path: 'CategoriesInMemory.repository',
				cause: 'Error on findByIdAndDelete operation',
			});
		}
		const [deletedCategory] = this.categories.splice(categoryIndex, 1);
		return deletedCategory;
	}

	async findByName(translations: FindCategoryByName): Promise<Category | null> {
		const category = this.categories.find((cat) => compareTranslationsName(cat.translations, translations));
		return category || null;
	}

	async findById(id: string): Promise<Category | null> {
		const category = this.categories.find((cat) => cat._id.toString() === id);
		return category || null;
	}

	async findAll(query: QueryParams): Promise<Category[]> {
		let foundCategories = [...this.categories];

		if (query.search) {
			foundCategories = filterItemsBySearchCriteria(foundCategories, query.search);
		}

		if (query.sort) {
			foundCategories = sortItemsByFields(foundCategories, query.sort);
		}

		foundCategories = paginateItems(
			foundCategories,
			query.limit || DEFAULT_QUERY_PARAMS.limit,
			query.page || DEFAULT_QUERY_PARAMS.page,
		);

		return foundCategories;
	}

	async findByIdList(ids: string[]): Promise<Category[]> {
		const categories = this.categories.filter((cat) => ids.includes(cat._id.toString()));
		return categories;
	}
}
