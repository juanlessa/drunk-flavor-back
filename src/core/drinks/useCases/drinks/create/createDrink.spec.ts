import { Category } from '@/core/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateDrinkService } from './CreateDrink.service';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Drink } from '@/core/drinks/entities/drink.entity';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let drinksRepository: IDrinksRepository;
let service: CreateDrinkService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
const { translations: ingredientTranslations, is_alcoholic: ingredientIsAlcoholic } = createIngredientFactory();
let createdIngredient: Ingredient;
const { translations } = createDrinkFactory();

describe('Create Drink', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		service = new CreateDrinkService(drinksRepository, ingredientsRepository);

		createdCategory = await categoriesRepository.create({ translations: categoryTranslations });
		createdIngredient = await ingredientsRepository.create({
			translations: ingredientTranslations,
			is_alcoholic: ingredientIsAlcoholic,
			category: createdCategory,
		});
	});

	it('should be able to create a new Drink', async () => {
		await service.execute({
			translations,
			ingredients: [{ ingredient_id: createdIngredient._id.toString(), quantity: 60 }],
		});

		const created = (await drinksRepository.findByName(translations)) as Drink;

		expect(created).toHaveProperty('_id');
		expect(created.translations).toEqual(translations);
		expect(created.ingredients.length).toEqual(1);
	});

	it('should not be able to create a drink with an existing name', async () => {
		await drinksRepository.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }],
		});

		await expect(
			service.execute({
				translations,
				ingredients: [{ ingredient_id: createdIngredient._id.toString(), quantity: 60 }],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to create a drink with a nonexistent ingredient', async () => {
		await expect(
			service.execute({
				translations,
				ingredients: [{ ingredient_id: new ObjectId().toString(), quantity: 60 }],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
