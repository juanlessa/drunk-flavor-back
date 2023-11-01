import AppError from '@shared/errors/AppError';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetIngredientService } from '@modules/drinks/useCases/getIngredient/GetIngredient.service';
import { ITranslations } from '@modules/drinks/types/translations';
import { IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let getIngredientService: GetIngredientService;

// test constants
const translations: ITranslations<IIngredientTranslation> = {
	en: { name: 'en name', unit: 'ml', unit_plural: 'ml' },
	pt: { name: 'pt name', unit: 'ml', unit_plural: 'ml' }
};
const isAlcoholic = true;
const categoryTranslations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'category en name'
	},
	pt: { name: 'category pt name' }
};
let createdCategory: ICategory;

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		getIngredientService = new GetIngredientService(ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
	});
	it('should be able to find an ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			translations,
			category: createdCategory,
			is_alcoholic: isAlcoholic
		});

		const ingredientFound = await getIngredientService.execute({ id: createdIngredient._id });

		expect(ingredientFound._id).toEqual(createdIngredient._id);
		expect(ingredientFound.translations).toEqual(createdIngredient.translations);
		expect(ingredientFound.category).toEqual(createdCategory);
		expect(ingredientFound.is_alcoholic).toEqual(isAlcoholic);
	});

	it('should not be able to find a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(getIngredientService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(INGREDIENT_ERRORS.not_found)
		);
	});
});
