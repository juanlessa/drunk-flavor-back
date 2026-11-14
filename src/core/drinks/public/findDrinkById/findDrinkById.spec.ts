import { beforeEach, describe, expect, it } from 'vitest';
import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { FindDrinkByIdService } from './FindDrinkById.service';

let repositories: {
	categoriesRepository: CategoriesRepositoryInMemory;
	unitsRepository: UnitsRepositoryInMemory;
	ingredientsRepository: IngredientsRepositoryInMemory;
	drinksRepository: DrinksRepositoryInMemory;
};
let service: FindDrinkByIdService;

describe('Find Drink By Id', () => {
	beforeEach(() => {
		repositories = {
			categoriesRepository: new CategoriesRepositoryInMemory(),
			unitsRepository: new UnitsRepositoryInMemory(),
			ingredientsRepository: new IngredientsRepositoryInMemory(),
			drinksRepository: new DrinksRepositoryInMemory(),
		};
		service = new FindDrinkByIdService(repositories.drinksRepository);
	});

	it('finds and returns a domain drink by id', async () => {
		const { drink } = await seedDrink(repositories, '66b0000000000000000000a1');

		await expect(service.execute({ drinkId: drink.id })).resolves.toEqual(drink);
	});

	it('returns null when the drink does not exist', async () => {
		await expect(service.execute({ drinkId: '66b0000000000000000000ff' })).resolves.toBeNull();
	});
});
