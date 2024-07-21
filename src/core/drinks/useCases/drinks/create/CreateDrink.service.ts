import { DrinkIngredient } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { CreateDrinkDTO } from './createDrink.dtos';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { DRINK_MESSAGES } from '@/core/drinks/constants/drinks.constants';

export class CreateDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
	) {}

	async execute({ translations, ingredients }: CreateDrinkDTO) {
		const translationsName = mapToTranslationsName(translations);
		const drinkALreadyExists = await this.drinksRepository.findByName(translationsName);
		if (drinkALreadyExists) {
			throw new BadRequestError(DRINK_MESSAGES.alreadyExist.message, { path: 'CreateDrink.service' });
		}

		const ingredientsExists = await this.ingredientsRepository.findByIdList(
			ingredients.map((ing) => ing.ingredient_id),
		);
		if (ingredientsExists.length !== ingredients.length) {
			throw new BadRequestError(DRINK_MESSAGES.someIngredientsNotExist.message, { path: 'CreateDrink.service' });
		}

		const ingredientsMap = ingredientsExists.reduce(
			(accumulator, ing) => ({ ...accumulator, [ing._id.toString()]: ing }),
			{} as { [key: string]: Ingredient },
		);
		const ingredientsFormatted: DrinkIngredient[] = ingredients.map((ing) => {
			return {
				ingredient: ingredientsMap[ing.ingredient_id],
				quantity: ing.quantity,
			};
		});

		await this.drinksRepository.create({ translations, ingredients: ingredientsFormatted });
	}
}
