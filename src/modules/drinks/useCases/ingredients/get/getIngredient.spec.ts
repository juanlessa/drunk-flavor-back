import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/IngredientsRepository';
import { GetIngredientService } from './GetIngredient.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';
import { createCategoryFactory, createIngredientFactory } from '@/modules/drinks/container';
import { Category } from '@/modules/drinks/entities/category.entity';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let service: GetIngredientService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
const { translations, is_alcoholic } = createIngredientFactory();

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		service = new GetIngredientService(ingredientsRepositoryInMemory);

		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
	});
	it('should be able to find an ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			translations,
			category: createdCategory,
			is_alcoholic,
		});

		const ingredientFound = await service.execute({ id: createdIngredient._id.toString() });

		expect(ingredientFound._id).toEqual(createdIngredient._id);
		expect(ingredientFound.translations).toEqual(createdIngredient.translations);
		expect(ingredientFound.category).toEqual(createdCategory);
		expect(ingredientFound.is_alcoholic).toEqual(is_alcoholic);
	});

	it('should not be able to find a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
