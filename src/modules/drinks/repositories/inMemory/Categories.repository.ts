import { Category } from '@/modules/drinks/entities/category.entity';
import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/modules/drinks/dtos/category.dtos';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { ObjectId } from 'mongodb';
import { compareTranslationsName } from '@/modules/drinks/helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helpers';
import { CATEGORY_MESSAGES } from '@/shared/constants/ResponseMessages';

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

	async findAll(): Promise<Category[]> {
		const categories = [...this.categories];
		return categories;
	}

	async findByIdList(ids: string[]): Promise<Category[]> {
		const categories = this.categories.filter((cat) => ids.includes(cat._id.toString()));
		return categories;
	}
}
