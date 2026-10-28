import { DrinkIngredient } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { CreateDrinkDTO } from './createDrink.dtos';

export class CreateDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
	) {}

	async execute({ translations, ingredients }: CreateDrinkDTO): Promise<string> {
		if (await this.drinksRepository.findByName(mapToTranslationsName(translations))) {
			throw new BadRequestError('apiResponses.drinks.alreadyExist', { path: 'CreateDrink.service' });
		}
		const existingIngredients = await this.ingredientsRepository.findByIdList(
			ingredients.map(({ ingredientId }) => ingredientId),
		);
		if (existingIngredients.length !== ingredients.length) {
			throw new BadRequestError('apiResponses.drinks.someIngredientsNotExist', { path: 'CreateDrink.service' });
		}
		const ingredientsById = existingIngredients.reduce<Record<string, Ingredient>>(
			(accumulator, ingredient) => ({ ...accumulator, [ingredient.id]: ingredient }),
			{},
		);
		const formattedIngredients: DrinkIngredient[] = ingredients.map(({ ingredientId, quantity }) => ({
			ingredient: ingredientsById[ingredientId],
			quantity,
		}));
		const drink = await this.drinksRepository.create({ translations, ingredients: formattedIngredients });
		return drink.id;
	}
}
