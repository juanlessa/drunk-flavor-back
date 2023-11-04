import { IUpdateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';
import { IDrinkIngredient } from '@modules/drinks/entities/drink.entity';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { mapToTranslationsName } from '@modules/drinks/mappers/translations.mapper';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@shared/errors/error.lib';

class UpdateDrinkService {
	constructor(private drinksRepository: IDrinksRepository, private ingredientsRepository: IIngredientsRepository) {}
	async execute({ id, translations, ingredients }: IUpdateDrinkRequest): Promise<void> {
		const drinkExists = await this.drinksRepository.findById(id);
		if (!drinkExists) {
			throw new BadRequestError(DRINK_ERRORS.not_exist, { path: 'UpdateDrink.service' });
		}

		const translationsName = mapToTranslationsName(translations);
		const drinkNameALreadyExists = await this.drinksRepository.findByName(translationsName);
		if (drinkNameALreadyExists && drinkExists._id.toString() !== drinkNameALreadyExists._id.toString()) {
			throw new BadRequestError(DRINK_ERRORS.name_already_exit, { path: 'UpdateDrink.service' });
		}

		const ingredientsExists = await this.ingredientsRepository.findByIdList(
			ingredients.map((ing) => ing.ingredient_id)
		);
		if (ingredientsExists.length !== ingredients.length) {
			throw new BadRequestError(DRINK_ERRORS.some_ingredients_not_exist, { path: 'UpdateDrink.service' });
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
		await this.drinksRepository.update({ id, translations, ingredients: ingredientsFormatted });
	}
}

export { UpdateDrinkService };
