import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateDrinkService } from './UpdateDrink.service';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { ITranslations } from '@modules/drinks/types/translations';
import { IDrinkTranslation } from '@modules/drinks/entities/drink.entity';
import { IIngredient, IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { BadRequestError } from '@shared/errors/error.lib';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkService: UpdateDrinkService;

// test constants
const translations: ITranslations<IDrinkTranslation> = {
	en: { name: 'en name', method: 'en method...' },
	pt: { name: 'pt name', method: 'pt method...' }
};

const updatedTranslations: ITranslations<IDrinkTranslation> = {
	en: { name: 'updated en name', method: 'en method...' },
	pt: { name: 'updated pt name', method: 'pt method...' }
};

const ingredientTranslations: ITranslations<IIngredientTranslation> = {
	en: { name: 'en name', unit: 'ml', unit_plural: 'ml' },
	pt: { name: 'pt name', unit: 'ml', unit_plural: 'ml' }
};
const updatedIngredientTranslations: ITranslations<IIngredientTranslation> = {
	en: { name: 'updated en name', unit: 'ml', unit_plural: 'ml' },
	pt: { name: 'updated pt name', unit: 'ml', unit_plural: 'ml' }
};
const ingredientIsAlcoholic = true;
let createdIngredient: IIngredient;
let updatedIngredient: IIngredient;
const categoryTranslations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'category en name'
	},
	pt: { name: 'category pt name' }
};
let createdCategory: ICategory;

describe('Update Drink', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		updateDrinkService = new UpdateDrinkService(drinksRepositoryInMemory, ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations: categoryTranslations });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			translations: ingredientTranslations,
			category: createdCategory,
			is_alcoholic: ingredientIsAlcoholic
		});
		updatedIngredient = await ingredientsRepositoryInMemory.create({
			translations: updatedIngredientTranslations,
			category: createdCategory,
			is_alcoholic: ingredientIsAlcoholic
		});
	});

	it('should be able to update a drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }]
		});

		await updateDrinkService.execute({
			id: createdDrink._id,
			translations: updatedTranslations,
			ingredients: [{ ingredient_id: updatedIngredient._id, quantity: 15 }]
		});

		const findUpdatedDrink = await drinksRepositoryInMemory.findById(createdDrink._id);

		expect(findUpdatedDrink.translations).toEqual(updatedTranslations);
	});

	it('should not be able to update a nonexistent drink', async () => {
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkService.execute({
				id: nonexistentDrinkId,
				translations: updatedTranslations,
				ingredients: [{ ingredient_id: updatedIngredient._id, quantity: 12 }]
			})
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update drink name to an already existing name', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }]
		});
		await drinksRepositoryInMemory.create({
			translations: updatedTranslations,
			ingredients: [{ ingredient: updatedIngredient, quantity: 12 }]
		});

		await expect(
			updateDrinkService.execute({
				id: createdDrink._id,
				translations: updatedTranslations,
				ingredients: [{ ingredient_id: updatedIngredient._id, quantity: 12 }]
			})
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update a drink to add a nonexistent ingredient', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: createdIngredient, quantity: 60 }]
		});
		const nonexistentIngredientId = new ObjectId().toString();

		await expect(
			updateDrinkService.execute({
				id: createdDrink._id,
				translations: updatedTranslations,
				ingredients: [{ ingredient_id: nonexistentIngredientId, quantity: 12 }]
			})
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
