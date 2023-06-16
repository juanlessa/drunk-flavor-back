import { ICreateIngredient, IUpdateIngredient } from '@modules/drinks/dtos/ingredients';
import Ingredient from '@modules/drinks/entities/Ingredient';
import { IIngredientsRepository } from '../IIngredientsRepository';
import { ObjectId } from 'bson';

class IngredientsRepositoryInMemory implements IIngredientsRepository {
	ingredients: Ingredient[] = [];

	async create({ name, category, unity, isAlcoholic, colorTheme }: ICreateIngredient): Promise<Ingredient> {
		const ingredient: Ingredient = {
			id: new ObjectId().toString(),
			name,
			category,
			unity,
			isAlcoholic,
			colorTheme,
			created_at: new Date()
		};

		this.ingredients.push(ingredient);

		return ingredient;
	}

	async update({ id, name, category, unity, isAlcoholic, colorTheme }: IUpdateIngredient): Promise<Ingredient> {
		let ingredient: Ingredient;

		this.ingredients = this.ingredients.map((ing) => {
			if (ing.id === id) {
				ingredient = {
					id: ing.id,
					name,
					category,
					unity,
					isAlcoholic,
					colorTheme,
					created_at: ing.created_at
				};
				return ingredient;
			}
			return ing;
		});

		return ingredient;
	}

	async delete(id: string): Promise<Ingredient> {
		let ingredient: Ingredient;
		const ingredientIndex = this.ingredients.findIndex((ing) => ing.id === id);
		if (ingredientIndex != -1) {
			const deleted = this.ingredients.splice(ingredientIndex, 1);
			ingredient = deleted[0];
		}
		return ingredient;
	}

	async findByName(name: string): Promise<Ingredient> {
		const result = this.ingredients.find((ing) => ing.name === name);
		return result;
	}

	async findById(id: string): Promise<Ingredient> {
		const result = this.ingredients.find((ing) => ing.id === id);
		return result;
	}

	async findAll(): Promise<Ingredient[]> {
		const results = [...this.ingredients];
		return results;
	}
	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		const results = this.ingredients.filter((ing) => ids.includes(ing.id));
		return results;
	}
}

export { IngredientsRepositoryInMemory };
