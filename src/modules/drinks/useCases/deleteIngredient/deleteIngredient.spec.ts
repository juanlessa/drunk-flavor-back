import AppError from '@shared/errors/AppError';
import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteIngredientService } from './DeleteIngredient.service';
import { ITranslations } from '@modules/drinks/types/translations';
import { IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let deleteIngredientService: DeleteIngredientService;

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

describe('Delete Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		deleteIngredientService = new DeleteIngredientService(ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
	});
	it('should be able to delete an ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			translations,
			category: createdCategory,
			is_alcoholic: isAlcoholic
		});

		await deleteIngredientService.execute({ id: createdIngredient._id });

		const findDeledIngredient = await ingredientsRepositoryInMemory.findById(createdIngredient._id);

		expect(findDeledIngredient).toBeUndefined();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteIngredientService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(INGREDIENT_ERRORS.not_exist)
		);
	});
});
