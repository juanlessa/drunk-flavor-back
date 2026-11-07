import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { mapDrinkIngredients } from '@/core/drinks/mappers/drinkIngredient.mappers';
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

	async execute({ translations, ingredients }: CreateDrinkDTO): Promise<string> {
		if (await this.drinksRepository.findByName(mapToTranslationsName(translations))) {
			throw new ConflictError('apiResponses.drinks.alreadyExist', { path: 'CreateDrink.service' });
		}
		const uniqueIngredientIds = [...new Set(ingredients.map(({ ingredientId }) => ingredientId))];
		const existingIngredients = await this.ingredientsRepository.findByIdList(uniqueIngredientIds);
		if (existingIngredients.length !== uniqueIngredientIds.length) {
			throw new BadRequestError('apiResponses.drinks.someIngredientsNotExist', { path: 'CreateDrink.service' });
		}
		const ingredientsById = existingIngredients.reduce<Record<string, Ingredient>>(
			(accumulator, ingredient) => ({ ...accumulator, [ingredient.id]: ingredient }),
			{},
		);
		const formattedIngredients = mapDrinkIngredients(ingredients, ingredientsById);
		const drink = await this.drinksRepository.create({ translations, ingredients: formattedIngredients });
		return drink.id;
	}
}
