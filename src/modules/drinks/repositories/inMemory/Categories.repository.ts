import { ICategory } from '@modules/drinks/entities/category.entity';
import { ICreateCategory, IFindCategoryByName, IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { ObjectId } from 'bson';
import { compareTranslationsName } from '@modules/drinks/repositories/inMemory/utils/compareTranslationsName';
import { NotFoundError } from '@shared/errors/error.lib';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';

class CategoriesRepositoryInMemory implements ICategoriesRepository {
	categories: ICategory[] = [];

	async create({ translations }: ICreateCategory): Promise<ICategory> {
		const category: ICategory = {
			_id: new ObjectId().toString(),
			translations,
			created_at: new Date(),
			updated_at: new Date()
		};

		this.categories.push(category);
		return category;
	}

	async update({ id, ...data }: IUpdateCategory): Promise<ICategory> {
		const categoryIndex = this.categories.findIndex((cat) => cat._id === id);
		if (categoryIndex === -1) {
			throw new NotFoundError(CATEGORY_ERRORS.not_found, {
				path: 'CategoriesInMemory.repository',
				cause: 'Error on findByIdAndUpdate operation'
			});
		}
		const category = this.categories[categoryIndex];
		category.translations = data.translations ?? category.translations;
		category.updated_at = new Date();

		this.categories[categoryIndex] = category;
		return category;
	}

	async delete(id: string): Promise<ICategory> {
		const categoryIndex = this.categories.findIndex((cat) => cat._id === id);
		if (categoryIndex === -1) {
			throw new NotFoundError(CATEGORY_ERRORS.not_found, {
				path: 'CategoriesInMemory.repository',
				cause: 'Error on findByIdAndDelete operation'
			});
		}
		const [deletedCategory] = this.categories.splice(categoryIndex, 1);
		return deletedCategory;
	}

	async findByName(translations: IFindCategoryByName): Promise<ICategory | null> {
		const category = this.categories.find((cat) => compareTranslationsName(cat.translations, translations));
		return category || null;
	}

	async findById(id: string): Promise<ICategory | null> {
		const category = this.categories.find((cat) => cat._id === id);
		return category || null;
	}

	async findAll(): Promise<ICategory[]> {
		const categories = [...this.categories];
		return categories;
	}

	async findByIdList(ids: string[]): Promise<ICategory[]> {
		const categories = this.categories.filter((cat) => ids.includes(cat._id));
		return categories;
	}
}

export { CategoriesRepositoryInMemory };
