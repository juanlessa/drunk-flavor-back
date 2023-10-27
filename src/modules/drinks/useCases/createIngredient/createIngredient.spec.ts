import AppError from '@shared/errors/AppError';
import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateIngredientService } from '@modules/drinks/useCases/createIngredient/CreateIngredient.service';
import { ITranslations } from '@modules/drinks/types/translations';
import { IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let createIngredientService: CreateIngredientService;

// test constants
const translations: ITranslations<IIngredientTranslation> = {
	en: { name: 'en name', unit: 'ml', unit_plural: 'ml' },
	pt: { name: 'pt name', unit: 'ml', unit_plural: 'ml' }
};

const translationsSameName: ITranslations<IIngredientTranslation> = {
	en: { name: 'en name', unit: 'ml', unit_plural: 'ml' },
	pt: { name: 'pt different name', unit: 'ml', unit_plural: 'ml' }
};
const isAlcoholic = true;

const categoryTranslations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'category en name'
	},
	pt: { name: 'category pt name' }
};
let createdCategory: ICategory;

describe('Create Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		createIngredientService = new CreateIngredientService(
			ingredientsRepositoryInMemory,
			categoriesRepositoryInMemory
		);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
	});

	it('should be able to create a new ingredient', async () => {
		await createIngredientService.execute({
			translations,
			is_alcoholic: isAlcoholic,
			category_id: createdCategory._id
		});

		const createdIngredient = await ingredientsRepositoryInMemory.findByName(translations);

		expect(createdIngredient).toHaveProperty('_id');
		expect(createdIngredient.translations).toEqual(translations);
		expect(createdIngredient.category).toEqual(createdCategory);
		expect(createdIngredient.is_alcoholic).toEqual(isAlcoholic);
	});

	it('should not be able to create an ingredient with an existing name', async () => {
		await ingredientsRepositoryInMemory.create({
			translations,
			is_alcoholic: isAlcoholic,
			category: createdCategory
		});

		await expect(
			createIngredientService.execute({
				translations: translationsSameName,
				is_alcoholic: isAlcoholic,
				category_id: createdCategory._id
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.already_exist));
	});

	it('should not be able to create a ingredient with a nonexistent category', async () => {
		await expect(
			createIngredientService.execute({
				translations,
				category_id: new ObjectId().toString(),
				is_alcoholic: isAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.invalid_category_format));
	});
});
