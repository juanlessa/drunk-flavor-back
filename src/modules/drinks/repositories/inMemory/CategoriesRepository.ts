import Category from '@modules/drinks/entities/Category';
import { ICreateCategory, IUpdateCategory } from '@modules/drinks/dtos/Categories';
import { ICategoriesRepository } from '../ICategoriesRepository';
import { ObjectId } from 'bson';

class CategoriesRepositoryInMemory implements ICategoriesRepository {
	categories: Category[] = [];

	async create({ name }: ICreateCategory): Promise<Category> {
		const category: Category = {
			id: new ObjectId().toString(),
			name,
			created_at: new Date()
		};

		this.categories.push(category);

		return category;
	}

	async update({ id, name }: IUpdateCategory): Promise<Category> {
		let category: Category;

		this.categories = this.categories.map((cat) => {
			if (cat.id === id) {
				category = {
					id: cat.id,
					name,
					created_at: cat.created_at
				};
				return category;
			}
			return cat;
		});

		return category;
	}

	async delete(id: string): Promise<Category> {
		let category: Category;
		const categoryIndex = this.categories.findIndex((cat) => cat.id === id);
		if (categoryIndex != -1) {
			const deleted = this.categories.splice(categoryIndex, 1);
			category = deleted[0];
		}
		return category;
	}

	async findByName(name: string): Promise<Category> {
		const category = this.categories.find((cat) => cat.name === name);
		return category;
	}

	async findById(id: string): Promise<Category> {
		const category = this.categories.find((cat) => cat.id === id);
		return category;
	}

	async findAll(): Promise<Category[]> {
		const categories = [...this.categories];
		return categories;
	}
	async findByIdList(ids: string[]): Promise<Category[]> {
		const categories = this.categories.filter((cat) => ids.includes(cat.id));
		return categories;
	}
}

export { CategoriesRepositoryInMemory };
