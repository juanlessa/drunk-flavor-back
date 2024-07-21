import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ObjectId } from 'mongodb';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { INGREDIENT_MESSAGES } from '@/core/drinks/constants/ingredients.constants';
import { QueryParams } from '@/shared/types/query.types';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class IngredientsRepositoryInMemory implements IIngredientsRepository {
	ingredients: Ingredient[] = [];

	async create({ translations, category, is_alcoholic }: CreateIngredient): Promise<Ingredient> {
		let ingredient: Ingredient = {
			translations,
			is_alcoholic,
			category,
			_id: new ObjectId(),
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.ingredients.push(ingredient);
		return ingredient;
	}

	async update({ id, ...data }: UpdateIngredient): Promise<Ingredient> {
		const ingredientIndex = this.ingredients.findIndex((ing) => ing._id.toString() === id);
		if (ingredientIndex === -1) {
			throw new NotFoundError(INGREDIENT_MESSAGES.notFound.message, {
				path: 'IngredientsInMemory.repository',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		let ingredient = this.ingredients[ingredientIndex];
		ingredient = deepUpdate(data, ingredient);
		ingredient.updated_at = new Date();

		this.ingredients[ingredientIndex] = ingredient;
		return ingredient;
	}

	async delete(id: string): Promise<Ingredient> {
		const ingredientIndex = this.ingredients.findIndex((ing) => ing._id.toString() === id);
		if (ingredientIndex === -1) {
			throw new NotFoundError(INGREDIENT_MESSAGES.notFound.message, {
				path: 'IngredientsInMemory.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		const [deletedIngredient] = this.ingredients.splice(ingredientIndex, 1);
		return deletedIngredient;
	}

	async findByName(translations: FindIngredientByName): Promise<Ingredient | null> {
		const ingredient = this.ingredients.find((ing) => compareTranslationsName(ing.translations, translations));
		return ingredient || null;
	}

	async findById(id: string): Promise<Ingredient | null> {
		const ingredient = this.ingredients.find((ing) => ing._id.toString() === id);
		return ingredient || null;
	}

	async findAll(query: QueryParams): Promise<Ingredient[]> {
		let found = [...this.ingredients];

		if (query.search) {
			found = filterItemsBySearchCriteria(found, query.search);
		}

		if (query.sort) {
			found = sortItemsByFields(found, query.sort);
		}

		found = paginateItems(
			found,
			query.limit || DEFAULT_QUERY_PARAMS.limit,
			query.page || DEFAULT_QUERY_PARAMS.page,
		);

		return found;
	}

	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		const ingredients = this.ingredients.filter((ing) => ids.includes(ing._id.toString()));
		return ingredients;
	}
}
