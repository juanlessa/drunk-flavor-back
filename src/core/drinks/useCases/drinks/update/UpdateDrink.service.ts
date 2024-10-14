import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { UpdateDrinkReqBody } from './updateDrink.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { DrinkIngredient } from '@/core/drinks/entities/drink.entity';

export class UpdateDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
	) {}

	async execute({ id, translations, ingredients }: UpdateDrinkReqBody) {
		const drinkExists = await this.drinksRepository.findById(id);
		if (!drinkExists) {
			throw new BadRequestError('apiResponses.drinks.notExist', { path: 'UpdateDrink.service.1' });
		}

		const translationsName = mapToTranslationsName(translations);
		const drinkNameALreadyExists = await this.drinksRepository.findByName(translationsName);
		if (drinkNameALreadyExists && drinkExists._id.toString() !== drinkNameALreadyExists._id.toString()) {
			throw new BadRequestError('apiResponses.drinks.nameAlreadyExist', { path: 'UpdateDrink.service.2' });
		}

		const ingredientsExists = await this.ingredientsRepository.findByIdList(
			ingredients.map((ing) => ing.ingredient_id),
		);
		if (ingredientsExists.length !== ingredients.length) {
			throw new BadRequestError('apiResponses.drinks.someIngredientsNotExist', {
				path: 'UpdateDrink.service.3',
			});
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

		await this.drinksRepository.update({ id, translations, ingredients: ingredientsFormatted });
	}
}
