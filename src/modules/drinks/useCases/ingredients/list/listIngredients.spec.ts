import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/IngredientsRepository';
import { ListIngredientsService } from './ListIngredients.service';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';
import { createCategoryFactory, createIngredientFactory } from '@/modules/drinks/container';
import { Category } from '@/modules/drinks/entities/category.entity';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let service: ListIngredientsService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
const { translations, is_alcoholic } = createIngredientFactory();

describe('List Ingredients', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		service = new ListIngredientsService(ingredientsRepositoryInMemory);

		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
	});

	it('should be able to list all ingredients', async () => {
		await ingredientsRepositoryInMemory.create({
			translations,
			category: createdCategory,
			is_alcoholic,
		});

		const ingredientsFound = await service.execute();

		expect(ingredientsFound.length).toEqual(1);
	});
});
