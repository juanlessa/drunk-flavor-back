import { beforeEach, describe, expect, it } from 'vitest';
import { actorWithRole, withActor } from '@/core/drinks/factories/authorship.factories';
import { seedIngredient } from '@/core/drinks/factories/seed.factories';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { DeleteIngredientService } from './DeleteIngredient.service';

const creatorId = '66b0000000000000000000a1';

let ingredientsRepository: IngredientsRepositoryInMemory;
let service: DeleteIngredientService;
let ingredient: Ingredient;

describe('Delete Ingredient: authorship', () => {
	beforeEach(async () => {
		ingredientsRepository = new IngredientsRepositoryInMemory();
		service = new DeleteIngredientService(ingredientsRepository);
		({ ingredient } = await seedIngredient(
			{
				categoriesRepository: new CategoriesRepositoryInMemory(),
				unitsRepository: new UnitsRepositoryInMemory(),
				ingredientsRepository,
			},
			creatorId,
		));
	});

	it.each([Roles.admin, Roles.owner])('lets the %s delete an ingredient created by someone else', async (role) => {
		await service.execute(withActor({ id: ingredient.id }, actorWithRole(role)));

		expect(await ingredientsRepository.findById(ingredient.id)).toBeNull();
	});

	it('lets a partner delete an ingredient they created', async () => {
		await service.execute(withActor({ id: ingredient.id }, actorWithRole(Roles.partner, creatorId)));

		expect(await ingredientsRepository.findById(ingredient.id)).toBeNull();
	});

	it('does not let a partner delete an ingredient created by someone else', async () => {
		await expect(
			service.execute(withActor({ id: ingredient.id }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(ForbiddenError);
		expect(await ingredientsRepository.findById(ingredient.id)).not.toBeNull();
	});

	it('does not let a partner delete an ingredient whose creator closed the account', async () => {
		await ingredientsRepository.clearCreatorByUser(creatorId);

		await expect(
			service.execute(withActor({ id: ingredient.id }, actorWithRole(Roles.partner, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
		expect(await ingredientsRepository.findById(ingredient.id)).not.toBeNull();
	});

	it('does not let a member delete an ingredient, not even one that has their id as creator', async () => {
		await expect(
			service.execute(withActor({ id: ingredient.id }, actorWithRole(Roles.member, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('reports a missing ingredient before checking who asks', async () => {
		await expect(
			service.execute(withActor({ id: '66b0000000000000000000ff' }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
