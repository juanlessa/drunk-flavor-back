import { beforeEach, describe, expect, it } from 'vitest';
import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { ApplyRatingDeltaService } from './ApplyRatingDelta.service';

let repositories: {
	categoriesRepository: CategoriesRepositoryInMemory;
	unitsRepository: UnitsRepositoryInMemory;
	ingredientsRepository: IngredientsRepositoryInMemory;
	drinksRepository: DrinksRepositoryInMemory;
};
let service: ApplyRatingDeltaService;

describe('Apply Rating Delta', () => {
	beforeEach(() => {
		repositories = {
			categoriesRepository: new CategoriesRepositoryInMemory(),
			unitsRepository: new UnitsRepositoryInMemory(),
			ingredientsRepository: new IngredientsRepositoryInMemory(),
			drinksRepository: new DrinksRepositoryInMemory(),
		};
		service = new ApplyRatingDeltaService(repositories.drinksRepository);
	});

	it('adds a rating and returns the new summary', async () => {
		const { drink } = await seedDrink(repositories, '66b0000000000000000000a1');

		await expect(service.execute({ drinkId: drink.id, countDelta: 1, sumDelta: 4 })).resolves.toEqual({
			average: 4,
			count: 1,
		});
		await expect(service.execute({ drinkId: drink.id, countDelta: 1, sumDelta: 2 })).resolves.toEqual({
			average: 3,
			count: 2,
		});
	});

	it('changes a rating without changing the count', async () => {
		const { drink } = await seedDrink(repositories, '66b0000000000000000000a1');
		await service.execute({ drinkId: drink.id, countDelta: 1, sumDelta: 4 });

		await expect(service.execute({ drinkId: drink.id, countDelta: 0, sumDelta: -2 })).resolves.toEqual({
			average: 2,
			count: 1,
		});
	});
});
