import { resolveDrinkMethod } from '@/core/drinks/helpers/drinkMethod.helpers';
import { resolveDrinkRecipe } from '@/core/drinks/helpers/drinkRecipe.helpers';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ConflictError } from '@/shared/error/error.lib';
import { CreateDrinkDTO } from './createDrink.dtos';

const path = 'CreateDrink.service';

export class CreateDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
	) {}

	async execute({ translations, ingredients, garnishes = [], preparation, actor }: CreateDrinkDTO): Promise<string> {
		if (await this.drinksRepository.findByName(mapToTranslationsName(translations))) {
			throw new ConflictError('apiResponses.drinks.alreadyExist', { path });
		}

		const recipe = await resolveDrinkRecipe(this.ingredientsRepository, { ingredients, garnishes }, path);
		const method = resolveDrinkMethod({ translations, preparation }, recipe, path);

		const drink = await this.drinksRepository.create({ ...method, ...recipe, createdBy: actor.id });
		return drink.id;
	}
}
