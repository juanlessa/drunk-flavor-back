import { beforeEach, describe, expect, it } from 'vitest';
import { actorWithRole, withActor } from '@/core/drinks/factories/authorship.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { seedCategoryAndUnit } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { CreateIngredientService } from './CreateIngredient.service';

let ingredientsRepository: IngredientsRepositoryInMemory;
let categoriesRepository: CategoriesRepositoryInMemory;
let unitsRepository: UnitsRepositoryInMemory;
let service: CreateIngredientService;

describe('Create Ingredient: authorship', () => {
	beforeEach(() => {
		ingredientsRepository = new IngredientsRepositoryInMemory();
		categoriesRepository = new CategoriesRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		service = new CreateIngredientService(ingredientsRepository, categoriesRepository, unitsRepository);
	});

	const request = async () => {
		const { category, unit } = await seedCategoryAndUnit({ categoriesRepository, unitsRepository });
		return { ...createIngredientFactory(), categoryId: category.id, unitIds: [unit.id] };
	};

	it.each([Roles.partner, Roles.admin, Roles.owner])(
		'records the %s as the creator and the last editor',
		async (role) => {
			const data = await request();

			const created = await service.execute(withActor(data, actorWithRole(role, 'creator-id')));

			expect(created).toMatchObject({ createdBy: 'creator-id', updatedBy: 'creator-id' });
		},
	);

	it('does not take the creator from the data of the request', async () => {
		const data = { ...(await request()), createdBy: 'someone-else', updatedBy: 'someone-else' };

		const created = await service.execute(withActor(data, actorWithRole(Roles.partner, 'creator-id')));

		expect(created).toMatchObject({ createdBy: 'creator-id', updatedBy: 'creator-id' });
	});
});
