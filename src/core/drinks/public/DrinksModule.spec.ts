import { beforeEach, describe, expect, it } from 'vitest';
import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { DrinksModule } from './DrinksModule';

const alice = '66b0000000000000000000a1';
const bob = '66b0000000000000000000b2';

let repositories: {
	categoriesRepository: CategoriesRepositoryInMemory;
	unitsRepository: UnitsRepositoryInMemory;
	ingredientsRepository: IngredientsRepositoryInMemory;
	drinksRepository: DrinksRepositoryInMemory;
};
let drinksModule: DrinksModule;

describe('DrinksModule', () => {
	beforeEach(() => {
		repositories = {
			categoriesRepository: new CategoriesRepositoryInMemory(),
			unitsRepository: new UnitsRepositoryInMemory(),
			ingredientsRepository: new IngredientsRepositoryInMemory(),
			drinksRepository: new DrinksRepositoryInMemory(),
		};
		drinksModule = new DrinksModule(
			repositories.drinksRepository,
			repositories.ingredientsRepository,
			repositories.categoriesRepository,
			repositories.unitsRepository,
		);
	});

	describe('clearCreatorByUser', () => {
		it('anonymizes the four collections and adds up what it touched', async () => {
			const { drink, ingredient, category, unit } = await seedDrink(repositories, alice);

			// The drink, the ingredient, the category and the unit.
			expect(await drinksModule.clearCreatorByUser(alice)).toBe(4);

			expect(await repositories.drinksRepository.findById(drink.id)).not.toHaveProperty('createdBy');
			expect(await repositories.ingredientsRepository.findById(ingredient.id)).not.toHaveProperty('createdBy');
			expect(await repositories.categoriesRepository.findById(category.id)).not.toHaveProperty('createdBy');
			expect(await repositories.unitsRepository.findById(unit.id)).not.toHaveProperty('createdBy');
		});

		it('leaves what other users created', async () => {
			const { drink, ingredient } = await seedDrink(repositories, bob);

			expect(await drinksModule.clearCreatorByUser(alice)).toBe(0);

			expect(await repositories.drinksRepository.findById(drink.id)).toMatchObject({ createdBy: bob });
			expect(await repositories.ingredientsRepository.findById(ingredient.id)).toMatchObject({ createdBy: bob });
		});

		it('returns zero when the catalog is empty', async () => {
			expect(await drinksModule.clearCreatorByUser(alice)).toBe(0);
		});
	});
});
