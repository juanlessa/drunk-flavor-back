import { ICreateDrinkRequest, ICreateDrinkResponse } from '@modules/drinks/dtos/drink.dtos';
import { IDrinkIngredient } from '@modules/drinks/entities/drink.entity';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { mapToTranslationsName } from '@modules/drinks/mappers/translations.mapper';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import AppError from '@shared/errors/AppError';

class CreateDrinkService {
	constructor(private drinksRepository: IDrinksRepository, private ingredientsRepository: IIngredientsRepository) {}

	async execute({ translations, ingredients }: ICreateDrinkRequest): Promise<ICreateDrinkResponse> {
		const translationsName = mapToTranslationsName(translations);
		const drinkALreadyExists = await this.drinksRepository.findByName(translationsName);
		if (drinkALreadyExists) {
			throw new AppError(DRINK_ERRORS.already_exist);
		}

		const ingredientsExists = await this.ingredientsRepository.findByIdList(
			ingredients.map((ing) => ing.ingredient_id)
		);
		if (ingredientsExists.length !== ingredients.length) {
			throw new AppError(DRINK_ERRORS.some_ingredients_not_exist);
		}

		const ingredientsMap = ingredientsExists.reduce(
			(accumulator, ing) => ({ ...accumulator, [ing._id.toString()]: ing }),
			{} as { [key: string]: IIngredient }
		);
		const ingredientsFormatted: IDrinkIngredient[] = ingredients.map((ing) => {
			return {
				ingredient: ingredientsMap[ing.ingredient_id],
				quantity: ing.quantity
			};
		});

		const drink = await this.drinksRepository.create({ translations, ingredients: ingredientsFormatted });

		return { id: drink._id };
	}
}

export { CreateDrinkService };
