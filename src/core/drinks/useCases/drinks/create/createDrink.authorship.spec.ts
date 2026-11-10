import { beforeEach, describe, expect, it } from 'vitest';
import { actorWithRole, withActor } from '@/core/drinks/factories/authorship.factories';
import { createDrinkFactory, createDrinkIngredientInputFactory } from '@/core/drinks/factories/drink.factories';
import { seedIngredient } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { CreateDrinkService } from './CreateDrink.service';

let drinksRepository: DrinksRepositoryInMemory;
let ingredientsRepository: IngredientsRepositoryInMemory;
let service: CreateDrinkService;
let request: ReturnType<typeof createDrinkFactory> & {
	ingredients: ReturnType<typeof createDrinkIngredientInputFactory>[];
};

describe('Create Drink: authorship', () => {
	beforeEach(async () => {
		drinksRepository = new DrinksRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		service = new CreateDrinkService(drinksRepository, ingredientsRepository);
		const { ingredient, unit } = await seedIngredient({
			categoriesRepository: new CategoriesRepositoryInMemory(),
			unitsRepository: new UnitsRepositoryInMemory(),
			ingredientsRepository,
		});
		request = {
			...createDrinkFactory(),
			ingredients: [createDrinkIngredientInputFactory(ingredient.id, { unitId: unit.id })],
		};
	});

	it.each([Roles.partner, Roles.admin, Roles.owner])(
		'records the %s as the creator and the last editor',
		async (role) => {
			const id = await service.execute(withActor(request, actorWithRole(role, 'creator-id')));

			expect(await drinksRepository.findById(id)).toMatchObject({
				createdBy: 'creator-id',
				updatedBy: 'creator-id',
			});
		},
	);

	it('does not take the creator from the data of the request', async () => {
		const data = { ...request, createdBy: 'someone-else', updatedBy: 'someone-else' };

		const id = await service.execute(withActor(data, actorWithRole(Roles.partner, 'creator-id')));

		expect(await drinksRepository.findById(id)).toMatchObject({ createdBy: 'creator-id', updatedBy: 'creator-id' });
	});
});
