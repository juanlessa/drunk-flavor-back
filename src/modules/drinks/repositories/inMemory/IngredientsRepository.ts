import { ICreateIngredient, IFindIngredientByName, IUpdateIngredient } from '@modules/drinks/dtos/ingredient.dtos';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import { ObjectId } from 'bson';
import { compareTranslationsName } from '@modules/drinks/repositories/inMemory/utils/compareTranslationsName';
import { NotFoundError } from '@shared/errors/error.lib';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';

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
		const ingredientIndex = this.ingredients.findIndex((ing) => ing._id === id);
		if (ingredientIndex === -1) {
			throw new NotFoundError(INGREDIENT_ERRORS.not_found, {
				path: 'IngredientsInMemory.repository',
				cause: 'Error on findOneAndUpdate operation'
			});
		}

		const ingredient = this.ingredients[ingredientIndex];
		ingredient.translations = data.translations ?? ingredient.translations;
		ingredient.is_alcoholic = data.is_alcoholic ?? ingredient.is_alcoholic;
		ingredient.category = data.category ?? ingredient.category;
		ingredient.updated_at = new Date();

		this.ingredients[ingredientIndex] = ingredient;
		return ingredient;
	}

	async delete(id: string): Promise<IIngredient> {
		const ingredientIndex = this.ingredients.findIndex((ing) => ing._id === id);
		if (ingredientIndex === -1) {
			throw new NotFoundError(INGREDIENT_ERRORS.not_found, {
				path: 'IngredientsInMemory.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}
		const [deletedIngredient] = this.ingredients.splice(ingredientIndex, 1);
		return deletedIngredient;
	}

	async findByName(translations: IFindIngredientByName): Promise<IIngredient | null> {
		const ingredient = this.ingredients.find((ing) => compareTranslationsName(ing.translations, translations));
		return ingredient || null;
	}

	async findById(id: string): Promise<IIngredient | null> {
		const ingredient = this.ingredients.find((ing) => ing._id === id);
		return ingredient || null;
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
