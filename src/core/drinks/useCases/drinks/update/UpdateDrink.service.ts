import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { assertValidRecipe } from '@/core/drinks/helpers/recipe.helpers';
import { mapDrinkGarnishes, mapDrinkIngredients } from '@/core/drinks/mappers/drinkIngredient.mappers';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError, NotFoundError, ConflictError } from '@/shared/error/error.lib';
import { UpdateDrinkDTO } from './updateDrink.dtos';

export class UpdateDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
	) {}

	async execute({ id, translations, ingredients, garnishes }: UpdateDrinkDTO): Promise<void> {
		const drink = await this.drinksRepository.findById(id);
		if (!drink) throw new NotFoundError('apiResponses.drinks.notFound', { path: 'UpdateDrink.service.1' });
		const duplicate = await this.drinksRepository.findByName(mapToTranslationsName(translations));
		if (duplicate && duplicate.id !== drink.id) {
			throw new ConflictError('apiResponses.drinks.nameAlreadyExist', { path: 'UpdateDrink.service.2' });
		}
		// An ingredient may appear in both lists, so the existence check runs over the distinct ids.
		const uniqueIngredientIds = [
			...new Set([...ingredients, ...garnishes].map(({ ingredientId }) => ingredientId)),
		];
		const existingIngredients = await this.ingredientsRepository.findByIdList(uniqueIngredientIds);
		if (existingIngredients.length !== uniqueIngredientIds.length) {
			throw new BadRequestError('apiResponses.drinks.someIngredientsNotExist', { path: 'UpdateDrink.service.3' });
		}
		const ingredientsById = existingIngredients.reduce<Record<string, Ingredient>>(
			(accumulator, ingredient) => ({ ...accumulator, [ingredient.id]: ingredient }),
			{},
		);
		const recipeIngredients = mapDrinkIngredients(ingredients, ingredientsById);
		const recipeGarnishes = mapDrinkGarnishes(garnishes, ingredientsById);
		assertValidRecipe(recipeIngredients, recipeGarnishes, 'UpdateDrink.service');
		await this.drinksRepository.update({
			id,
			translations,
			ingredients: recipeIngredients,
			garnishes: recipeGarnishes,
		});
	}
}
