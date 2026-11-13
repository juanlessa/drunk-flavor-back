import { beforeEach, describe, expect, it } from 'vitest';
import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { FindDrinksByIdsService } from './FindDrinksByIds.service';

let repositories: {
	categoriesRepository: CategoriesRepositoryInMemory;
	unitsRepository: UnitsRepositoryInMemory;
	ingredientsRepository: IngredientsRepositoryInMemory;
	drinksRepository: DrinksRepositoryInMemory;
};
let service: FindDrinksByIdsService;

describe('Find Drinks By Ids', () => {
	beforeEach(() => {
		repositories = {
			categoriesRepository: new CategoriesRepositoryInMemory(),
			unitsRepository: new UnitsRepositoryInMemory(),
			ingredientsRepository: new IngredientsRepositoryInMemory(),
			drinksRepository: new DrinksRepositoryInMemory(),
		};
		service = new FindDrinksByIdsService(repositories.drinksRepository);
	});

	it('returns only the drinks that exist among the given ids', async () => {
		const { drink: first } = await seedDrink(repositories, '66b0000000000000000000a1');
		await seedDrink(repositories, '66b0000000000000000000a2');

		const found = await service.execute({ drinkIds: [first.id, '66b0000000000000000000ff'] });

		expect(found).toEqual([first]);
	});

});
