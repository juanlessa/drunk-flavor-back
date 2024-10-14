import { beforeEach, describe, expect, it } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ObjectId } from 'mongodb';
import { UpdateDrinkService } from './UpdateDrink.service';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Drink } from '@/core/drinks/entities/drink.entity';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let drinksRepository: IDrinksRepository;
let service: UpdateDrinkService;

const { translations: categoryTranslations } = createCategoryFactory();
const { translations: translationsIngredient } = createIngredientFactory();

const { translations } = createDrinkFactory();

const { translations: updatedTranslations } = createDrinkFactory({
	translations: {
		en: { name: 'cosmopolitan', method: 'preparation mode' },
		pt: { name: 'cosmopolitan', method: 'modo de preparo' },
	},
});

let ingredient: Ingredient;
let createdDrink: Drink;

describe('Update Drink', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		service = new UpdateDrinkService(drinksRepository, ingredientsRepository);

		const category = await categoriesRepository.create({ translations: categoryTranslations });
		ingredient = await ingredientsRepository.create({
			translations: translationsIngredient,
			is_alcoholic: false,
			category: category,
		});
		createdDrink = await drinksRepository.create({
			translations,
			ingredients: [{ quantity: 30, ingredient }],
		});
	});

	it('should be able to update a drink', async () => {
		await service.execute({
			id: createdDrink._id.toString(),
			translations: updatedTranslations,
			ingredients: [{ quantity: 60, ingredient_id: ingredient._id.toString() }],
		});

		const findUpdatedDrink = (await drinksRepository.findById(createdDrink._id.toString())) as Drink;

		expect(findUpdatedDrink.translations).toEqual(updatedTranslations);
		expect(findUpdatedDrink.ingredients.length).toEqual(1);
		expect(findUpdatedDrink.ingredients[0].quantity).toEqual(60);
	});

	it('should not be able to update a nonexistent drink', async () => {
		await expect(
			service.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
				ingredients: [{ quantity: 60, ingredient_id: ingredient._id.toString() }],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update a drink name to an existing name', async () => {
		await drinksRepository.create({
			translations: updatedTranslations,
			ingredients: [{ quantity: 30, ingredient }],
		});

		await expect(
			service.execute({
				id: createdDrink._id.toString(),
				translations: updatedTranslations,
				ingredients: [{ quantity: 60, ingredient_id: ingredient._id.toString() }],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update a drink with a nonexistent ingredient', async () => {
		await expect(
			service.execute({
				id: createdDrink._id.toString(),
				translations: updatedTranslations,
				ingredients: [{ quantity: 60, ingredient_id: new ObjectId().toString() }],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
