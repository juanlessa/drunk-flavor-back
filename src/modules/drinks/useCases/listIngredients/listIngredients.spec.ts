import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListIngredientsService } from '@modules/drinks/useCases/listIngredients/ListIngredients.service';
import { ITranslations } from '@modules/drinks/types/translations';
import { IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let listIngredientsService: ListIngredientsService;

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

describe('List Ingredients', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		listIngredientsService = new ListIngredientsService(ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
	});

	it('should be able to list all ingredients', async () => {
		await ingredientsRepositoryInMemory.create({
			translations,
			category: createdCategory,
			is_alcoholic: isAlcoholic
		});

		const ingredientsFound = await listIngredientsService.execute();

		expect(ingredientsFound.length).toEqual(1);
	});
});
