import { Category } from '@/modules/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteIngredientService } from './DeleteIngredient.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { createCategoryFactory, createIngredientFactory } from '@/modules/drinks/container';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let service: DeleteIngredientService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
const { translations, is_alcoholic } = createIngredientFactory();

describe('Delete Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		service = new DeleteIngredientService(ingredientsRepositoryInMemory);

		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
	});
	it('should be able to delete an ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			translations,
			category: createdCategory,
			is_alcoholic,
		});

		await service.execute({ id: createdIngredient._id.toString() });

		const findDeledIngredient = await ingredientsRepositoryInMemory.findById(createdIngredient._id.toString());

		expect(findDeledIngredient).toBeNull();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
