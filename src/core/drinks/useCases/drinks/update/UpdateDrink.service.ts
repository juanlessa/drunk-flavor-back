import { assertCanChangeDrink } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { resolveDrinkMethod } from '@/core/drinks/helpers/drinkMethod.helpers';
import { resolveDrinkRecipe } from '@/core/drinks/helpers/drinkRecipe.helpers';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { NotFoundError, ConflictError } from '@/shared/error/error.lib';
import { UpdateDrinkCommand } from './updateDrink.dtos';

const path = 'UpdateDrink.service';

export class UpdateDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
	) {}

	async execute({ id, translations, ingredients, garnishes, preparation, actor }: UpdateDrinkCommand): Promise<void> {
		const drink = await this.drinksRepository.findById(id);
		if (!drink) throw new NotFoundError('apiResponses.drinks.notFound', { path: `${path}.1` });
		assertCanChangeDrink('update', drink, actor, `${path}.forbidden`);

		const duplicate = await this.drinksRepository.findByName(mapToTranslationsName(translations));
		if (duplicate && duplicate.id !== drink.id) {
			throw new ConflictError('apiResponses.drinks.nameAlreadyExist', { path: `${path}.2` });
		}

		const recipe = await resolveDrinkRecipe(this.ingredientsRepository, { ingredients, garnishes }, path);
		const method = resolveDrinkMethod({ translations, preparation }, recipe, path);

		await this.drinksRepository.update({
			id,
			updatedBy: actor.id,
			...method,
			// A method written by hand no longer matches a stored plan, so the plan goes away with it.
			preparation: method.preparation ?? null,
			...recipe,
		});
	}
}
