import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { assertValidRecipe } from '@/core/drinks/helpers/recipe.helpers';
import { mapDrinkGarnishes, mapDrinkIngredients } from '@/core/drinks/mappers/drinkIngredient.mappers';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError, ConflictError } from '@/shared/error/error.lib';
import { CreateDrinkDTO } from './createDrink.dtos';

export class CreateDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
	) {}

	async execute({ translations, ingredients, garnishes = [] }: CreateDrinkDTO): Promise<string> {
		if (await this.drinksRepository.findByName(mapToTranslationsName(translations))) {
			throw new ConflictError('apiResponses.drinks.alreadyExist', { path: 'CreateDrink.service' });
		}
		// An ingredient may appear in both lists, so the existence check runs over the distinct ids.
		const uniqueIngredientIds = [
			...new Set([...ingredients, ...garnishes].map(({ ingredientId }) => ingredientId)),
		];
		const existingIngredients = await this.ingredientsRepository.findByIdList(uniqueIngredientIds);
		if (existingIngredients.length !== uniqueIngredientIds.length) {
			throw new BadRequestError('apiResponses.drinks.someIngredientsNotExist', { path: 'CreateDrink.service' });
		}
		const ingredientsById = existingIngredients.reduce<Record<string, Ingredient>>(
			(accumulator, ingredient) => ({ ...accumulator, [ingredient.id]: ingredient }),
			{},
		);
		const recipeIngredients = mapDrinkIngredients(ingredients, ingredientsById);
		const recipeGarnishes = mapDrinkGarnishes(garnishes, ingredientsById);
		assertValidRecipe(recipeIngredients, recipeGarnishes, 'CreateDrink.service');
		const drink = await this.drinksRepository.create({
			translations,
			ingredients: recipeIngredients,
			garnishes: recipeGarnishes,
		});
		return drink.id;
	}
}
