import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { DrinksModule } from '@/core/drinks/public/DrinksModule';
import { CategoryModel } from '../entities/category.model';
import { DrinkModel } from '../entities/drink.model';
import { IngredientModel } from '../entities/ingredient.model';
import { UnitModel } from '../entities/unit.model';
import { CategoriesRepository } from './Categories.repository';
import { DrinksRepository } from './Drinks.repository';
import { IngredientsRepository } from './Ingredients.repository';
import { UnitsRepository } from './Units.repository';

const alice = '66b0000000000000000000a1';
const bob = '66b0000000000000000000b2';

const categories = new CategoriesRepository();
const units = new UnitsRepository();
const ingredients = new IngredientsRepository();
const drinks = new DrinksRepository();

/** What the authorship contract cannot cover: the snapshots other records embed, and the rating projection. */
describe('Catalog authorship across collections (integration)', () => {
	beforeAll(async () => {
		await Promise.all([UnitModel.init(), CategoryModel.init(), IngredientModel.init(), DrinkModel.init()]);
	});

	afterEach(async () => {
		await Promise.all([
			UnitModel.deleteMany({}),
			CategoryModel.deleteMany({}),
			IngredientModel.deleteMany({}),
			DrinkModel.deleteMany({}),
		]);
	});

	const createIngredient = async (createdBy: string) => {
		const category = await categories.create({ ...createCategoryFactory(), createdBy: alice });
		const unit = await units.create({ ...createUnitFactory(), createdBy: alice });
		const ingredient = await ingredients.create({
			translations: { en: { name: 'Gin' }, pt: { name: 'Gin' } },
			category,
			units: [unit],
			createdBy,
		});
		return { category, unit, ingredient };
	};

	describe('snapshots', () => {
		it('stores the category and the units of an ingredient without who created them', async () => {
			const { ingredient } = await createIngredient(bob);

			expect(ingredient).toMatchObject({ createdBy: bob, updatedBy: bob });
			expect(ingredient.category).not.toHaveProperty('createdBy');
			expect(ingredient.category).not.toHaveProperty('updatedBy');
			expect(ingredient.units[0]).not.toHaveProperty('createdBy');
			expect(ingredient.units[0]).not.toHaveProperty('updatedBy');
		});

		it('keeps them out of the snapshots when the ingredient is updated', async () => {
			const { ingredient, category, unit } = await createIngredient(bob);

			const updated = await ingredients.update({ id: ingredient.id, updatedBy: alice, category, units: [unit] });

			expect(updated.category).not.toHaveProperty('createdBy');
			expect(updated.units[0]).not.toHaveProperty('updatedBy');
		});

		it('stores the recipe of a drink without who created the ingredients and units', async () => {
			const { ingredient, unit } = await createIngredient(alice);

			const drink = await drinks.create({
				translations: { en: { name: 'Gimlet', method: 'Shake' }, pt: { name: 'Gimlet', method: 'Agite' } },
				ingredients: [
					createDrinkIngredientFactory(ingredient, {
						amount: { type: DrinkIngredientAmountTypes.exact, quantity: 50, unit },
					}),
				],
				garnishes: [{ ingredient, amount: { type: DrinkIngredientAmountTypes.none } }],
				createdBy: bob,
			});

			expect(drink).toMatchObject({ createdBy: bob, updatedBy: bob });
			const [line] = drink.ingredients;
			expect(line.ingredient).not.toHaveProperty('createdBy');
			expect(line.ingredient.category).not.toHaveProperty('createdBy');
			expect((line.amount as { unit: object }).unit).not.toHaveProperty('createdBy');
			expect(drink.garnishes[0].ingredient).not.toHaveProperty('createdBy');
		});

		it('keeps them out of the recipe when the drink is updated', async () => {
			const { ingredient } = await createIngredient(alice);
			const drink = await drinks.create({
				translations: { en: { name: 'Gimlet', method: 'Shake' }, pt: { name: 'Gimlet', method: 'Agite' } },
				ingredients: [createDrinkIngredientFactory(ingredient)],
				createdBy: alice,
			});

			const updated = await drinks.update({
				id: drink.id,
				updatedBy: bob,
				ingredients: [createDrinkIngredientFactory(ingredient)],
			});

			expect(updated.ingredients[0].ingredient).not.toHaveProperty('createdBy');
			expect(updated.ingredients[0].ingredient).not.toHaveProperty('updatedBy');
		});
	});

	describe('rating projection', () => {
		it('does not change who last edited the drink', async () => {
			const { ingredient } = await createIngredient(alice);
			const drink = await drinks.create({
				translations: { en: { name: 'Gimlet', method: 'Shake' }, pt: { name: 'Gimlet', method: 'Agite' } },
				ingredients: [createDrinkIngredientFactory(ingredient)],
				createdBy: alice,
			});
			await drinks.update({ id: drink.id, updatedBy: bob, translations: drink.translations });

			await drinks.applyRatingDelta({ drinkId: drink.id, countDelta: 1, sumDelta: 5 });

			expect(await drinks.findById(drink.id)).toMatchObject({
				createdBy: alice,
				updatedBy: bob,
				ratingsCount: 1,
			});
		});
	});

	describe('DrinksModule.clearCreatorByUser', () => {
		it('anonymizes the four collections and returns how many records were touched', async () => {
			const { category, unit, ingredient } = await createIngredient(bob);
			await ingredients.update({ id: ingredient.id, updatedBy: alice, kind: 'generic' });
			const drink = await drinks.create({
				translations: { en: { name: 'Gimlet', method: 'Shake' }, pt: { name: 'Gimlet', method: 'Agite' } },
				ingredients: [createDrinkIngredientFactory(ingredient)],
				createdBy: alice,
			});
			const module = new DrinksModule(drinks, ingredients, categories, units);

			// The category, the unit, the ingredient (last edited by alice) and the drink.
			expect(await module.clearCreatorByUser(alice)).toBe(4);

			expect(await categories.findById(category.id)).not.toHaveProperty('createdBy');
			expect(await units.findById(unit.id)).not.toHaveProperty('createdBy');
			expect(await drinks.findById(drink.id)).not.toHaveProperty('createdBy');
			expect(await ingredients.findById(ingredient.id)).toMatchObject({ createdBy: bob });
			expect(await ingredients.findById(ingredient.id)).not.toHaveProperty('updatedBy');
		});

		it('returns zero for a user without records', async () => {
			await createIngredient(bob);

			const module = new DrinksModule(drinks, ingredients, categories, units);

			expect(await module.clearCreatorByUser('66b0000000000000000000c3')).toBe(0);
		});
	});
});
