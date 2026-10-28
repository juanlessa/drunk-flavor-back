import { DrinkIngredient } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateDrinkDTO } from './updateDrink.dtos';

export class UpdateDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
	) {}

	async execute({ id, translations, ingredients }: UpdateDrinkDTO): Promise<void> {
		const drink = await this.drinksRepository.findById(id);
		if (!drink) throw new BadRequestError('apiResponses.drinks.notExist', { path: 'UpdateDrink.service.1' });
		const duplicate = await this.drinksRepository.findByName(mapToTranslationsName(translations));
		if (duplicate && duplicate.id !== drink.id) {
			throw new BadRequestError('apiResponses.drinks.nameAlreadyExist', { path: 'UpdateDrink.service.2' });
		}
		const existingIngredients = await this.ingredientsRepository.findByIdList(
			ingredients.map(({ ingredientId }) => ingredientId),
		);
		if (existingIngredients.length !== ingredients.length) {
			throw new BadRequestError('apiResponses.drinks.someIngredientsNotExist', { path: 'UpdateDrink.service.3' });
		}
		const ingredientsById = existingIngredients.reduce<Record<string, Ingredient>>(
			(accumulator, ingredient) => ({ ...accumulator, [ingredient.id]: ingredient }),
			{},
		);
		const formattedIngredients: DrinkIngredient[] = ingredients.map(({ ingredientId, quantity }) => ({
			ingredient: ingredientsById[ingredientId],
			quantity,
		}));
		await this.drinksRepository.update({ id, translations, ingredients: formattedIngredients });
	}
}
