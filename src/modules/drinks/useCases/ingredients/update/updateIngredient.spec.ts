import { beforeEach, describe, expect, it } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import { UpdateIngredientService } from './UpdateIngredient.service';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';
import { createCategoryFactory, createIngredientFactory } from '@/modules/drinks/container';
import { Category } from '@/modules/drinks/entities/category.entity';
import { Ingredient } from '@/modules/drinks/entities/ingredient.entity';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let service: UpdateIngredientService;

const { translations: categoryTranslations } = createCategoryFactory();
const { translations: updatedCategoryTranslations } = createCategoryFactory({
	translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } },
});
let createdCategory: Category;
let updatedCategory: Category;
const { translations, is_alcoholic } = createIngredientFactory();
const { translations: updatedTranslations, is_alcoholic: updatedIsAlcoholic } = createIngredientFactory({
	translations: {
		en: { name: 'Lime juice', unit: 'ml', unit_plural: 'ml' },
		pt: { name: 'Suco de limão', unit: 'ml', unit_plural: 'ml' },
	},
	is_alcoholic: true,
});
let createdIngredient: Ingredient;

describe('Update Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		service = new UpdateIngredientService(ingredientsRepositoryInMemory, categoriesRepositoryInMemory);

		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		updatedCategory = await categoriesRepositoryInMemory.create({ translations: updatedCategoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations,
			is_alcoholic,
			category: createdCategory,
		});
	});

	it('should be able to update an ingredient', async () => {
		await service.execute({
			id: createdIngredient._id.toString(),
			translations: updatedTranslations,
			category_id: updatedCategory._id.toString(),
			is_alcoholic: updatedIsAlcoholic,
		});

		const findUpdatedIngredient = (await ingredientsRepositoryInMemory.findById(
			createdIngredient._id.toString(),
		)) as Ingredient;

		expect(findUpdatedIngredient.translations).toEqual(updatedTranslations);
		expect(findUpdatedIngredient.category).toEqual(updatedCategory);
		expect(findUpdatedIngredient.is_alcoholic).toEqual(updatedIsAlcoholic);
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		await expect(
			service.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
				category_id: updatedCategory._id.toString(),
				is_alcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		await ingredientsRepositoryInMemory.create({
			translations: updatedTranslations,
			category: updatedCategory,
			is_alcoholic: updatedIsAlcoholic,
		});

		await expect(
			service.execute({
				id: createdIngredient._id.toString(),
				translations: updatedTranslations,
				category_id: updatedCategory._id.toString(),
				is_alcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
	it('should not be able to update an ingredient to a nonexistent category', async () => {
		await expect(
			service.execute({
				id: createdIngredient._id.toString(),
				translations: updatedTranslations,
				category_id: new ObjectId().toString(),
				is_alcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
