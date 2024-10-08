import { Category } from '@/core/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateIngredientService } from './CreateIngredient.service';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { createCategoryFactory, createIngredientFactory } from '@/core/drinks/container';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let service: CreateIngredientService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
const { translations, is_alcoholic } = createIngredientFactory();

describe('Create Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		service = new CreateIngredientService(ingredientsRepositoryInMemory, categoriesRepositoryInMemory);

		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
	});

	it('should be able to create a new ingredient', async () => {
		await service.execute({ translations, is_alcoholic, category_id: createdCategory._id.toString() });

		const createdIngredient = (await ingredientsRepositoryInMemory.findByName(translations)) as Ingredient;

		expect(createdIngredient).toHaveProperty('_id');
		expect(createdIngredient.translations).toEqual(translations);
		expect(createdIngredient.category).toEqual(createdCategory);
		expect(createdIngredient.is_alcoholic).toEqual(is_alcoholic);
	});

	it('should not be able to create an ingredient with an existing name', async () => {
		await ingredientsRepositoryInMemory.create({
			translations,
			is_alcoholic,
			category: createdCategory,
		});

		await expect(
			service.execute({ translations, is_alcoholic, category_id: createdCategory._id.toString() }),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to create a ingredient with a nonexistent category', async () => {
		await expect(
			service.execute({
				translations,
				category_id: new ObjectId().toString(),
				is_alcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
