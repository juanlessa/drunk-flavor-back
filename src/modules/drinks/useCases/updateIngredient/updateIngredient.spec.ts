import AppError from '@errors/AppError';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateIngredientService } from './UpdateIngredient.service';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { IIngredient, IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { ITranslations } from '@modules/drinks/types/translations';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let updateIngredientService: UpdateIngredientService;

// test constants
const translations: ITranslations<IIngredientTranslation> = {
	en: { name: 'en name', unit: 'ml', unit_plural: 'ml' },
	pt: { name: 'pt name', unit: 'ml', unit_plural: 'ml' }
};

const updatedTranslations: ITranslations<IIngredientTranslation> = {
	en: { name: 'updated en name', unit: 'ml', unit_plural: 'ml' },
	pt: { name: 'updated pt name', unit: 'ml', unit_plural: 'ml' }
};
const isAlcoholic = true;
const updatedIsAlcoholic = false;
const categoryTranslations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'category en name'
	},
	pt: { name: 'category pt name' }
};
const updatedCategoryTranslations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'category en name'
	},
	pt: { name: 'category pt name' }
};
let createdCategory: ICategory;
let updatedCategory: ICategory;
let createdIngredient: IIngredient;

describe('Update Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		updateIngredientService = new UpdateIngredientService(
			ingredientsRepositoryInMemory,
			categoriesRepositoryInMemory
		);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		updatedCategory = await categoriesRepositoryInMemory.create({ translations: updatedCategoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations,
			is_alcoholic: isAlcoholic,
			category: createdCategory
		});
	});

	it('should be able to update an ingredient', async () => {
		await updateIngredientService.execute({
			id: createdIngredient._id,
			translations: updatedTranslations,
			category_id: updatedCategory._id,
			is_alcoholic: updatedIsAlcoholic
		});

		const findUpdatedIngredient = await ingredientsRepositoryInMemory.findById(createdIngredient._id);

		expect(findUpdatedIngredient.translations).toEqual(updatedTranslations);
		expect(findUpdatedIngredient.category).toEqual(updatedCategory);
		expect(findUpdatedIngredient.is_alcoholic).toEqual(updatedIsAlcoholic);
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		await expect(
			updateIngredientService.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
				category_id: updatedCategory._id,
				is_alcoholic: updatedIsAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.not_exist));
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		await ingredientsRepositoryInMemory.create({
			translations: updatedTranslations,
			category: updatedCategory,
			is_alcoholic: updatedIsAlcoholic
		});

		await expect(
			updateIngredientService.execute({
				id: createdIngredient._id,
				translations: updatedTranslations,
				category_id: updatedCategory._id,
				is_alcoholic: updatedIsAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.already_exist));
	});

	it('should not be able to update an ingredient to a nonexistent category', async () => {
		await expect(
			updateIngredientService.execute({
				id: createdIngredient._id,
				translations: updatedTranslations,
				category_id: new ObjectId().toString(),
				is_alcoholic: updatedIsAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.invalid_category_format));
	});
});
