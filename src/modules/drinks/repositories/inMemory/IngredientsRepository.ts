import { ICreateIngredient, IFindIngredientByName, IUpdateIngredient } from '@modules/drinks/dtos/ingredient.dtos';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '../IIngredients.repository';
import { ObjectId } from 'bson';
import { compareTranslationsName } from './utils/compareTranslationsName';

class IngredientsRepositoryInMemory implements IIngredientsRepository {
	ingredients: IIngredient[] = [];

	async create({ translations, category, is_alcoholic }: ICreateIngredient): Promise<IIngredient> {
		let ingredient: IIngredient = {
			translations,
			is_alcoholic,
			category,
			_id: new ObjectId().toString(),
			created_at: new Date(),
			updated_at: new Date()
		};

		this.ingredients.push(ingredient);

		return ingredient;
	}

	async update({ id, ...data }: IUpdateIngredient): Promise<IIngredient> {
		let ingredient: IIngredient;

		this.ingredients = this.ingredients.map((ing) => {
			if (ing._id === id) {
				ingredient = {
					_id: ing._id,
					translations: data.translations ?? ing.translations,
					is_alcoholic: data.is_alcoholic ?? ing.is_alcoholic,
					category: data.category ?? ing.category,
					created_at: ing.created_at,
					updated_at: new Date()
				};
				return ingredient;
			}
			return ing;
		});

		return ingredient;
	}

	async delete(id: string): Promise<IIngredient> {
		let ingredient: IIngredient;
		const ingredientIndex = this.ingredients.findIndex((ing) => ing._id === id);
		if (ingredientIndex != -1) {
			const deleted = this.ingredients.splice(ingredientIndex, 1);
			ingredient = deleted[0];
		}

		return ingredient;
	}

	async findByName(translations: IFindIngredientByName): Promise<IIngredient> {
		const ingredient = this.ingredients.find((ing) => compareTranslationsName(ing.translations, translations));
		return ingredient;
	}

	async findById(id: string): Promise<IIngredient> {
		const ingredient = this.ingredients.find((ing) => ing._id === id);
		return ingredient;
	}

	async findAll(): Promise<IIngredient[]> {
		const ingredients = [...this.ingredients];
		return ingredients;
	}

	async findByIdList(ids: string[]): Promise<IIngredient[]> {
		const ingredients = this.ingredients.filter((ing) => ids.includes(ing._id));
		return ingredients;
	}
}

export { IngredientsRepositoryInMemory };
