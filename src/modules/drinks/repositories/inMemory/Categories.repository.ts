import { ICategory } from '@modules/drinks/entities/category.entity';
import { ICreateCategory, IFindCategoryByName, IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { ObjectId } from 'bson';
import { compareTranslationsName } from '@modules/drinks/repositories/inMemory/utils/compareTranslationsName';

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

	async update({ id, translations }: IUpdateCategory): Promise<ICategory> {
		let category: ICategory;

		this.categories = this.categories.map((cat) => {
			if (cat._id === id) {
				category = {
					_id: cat._id,
					translations,
					created_at: cat.created_at,
					updated_at: new Date()
				};
				return category;
			}
			return cat;
		});

		return category;
	}

	async delete(id: string): Promise<ICategory> {
		let category: ICategory;
		const categoryIndex = this.categories.findIndex((cat) => cat._id === id);
		if (categoryIndex != -1) {
			const deleted = this.categories.splice(categoryIndex, 1);
			category = deleted[0];
		}
		return category;
	}

	async findByName(translations: IFindCategoryByName): Promise<ICategory> {
		const category = this.categories.find((cat) => compareTranslationsName(cat.translations, translations));
		return category;
	}

	async findById(id: string): Promise<ICategory> {
		const category = this.categories.find((cat) => cat._id === id);
		return category;
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
