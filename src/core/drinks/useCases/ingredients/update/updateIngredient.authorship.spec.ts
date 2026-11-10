import { beforeEach, describe, expect, it } from 'vitest';
import { actorWithRole, withActor } from '@/core/drinks/factories/authorship.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { seedIngredient } from '@/core/drinks/factories/seed.factories';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ConflictError, ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { UpdateIngredientService } from './UpdateIngredient.service';

const creatorId = '66b0000000000000000000a1';
const change = { translations: { en: { name: 'Lime juice' }, pt: { name: 'Suco de limão' } } };

let ingredientsRepository: IngredientsRepositoryInMemory;
let categoriesRepository: CategoriesRepositoryInMemory;
let unitsRepository: UnitsRepositoryInMemory;
let service: UpdateIngredientService;
let ingredient: Ingredient;
let request: { id: string; categoryId: string; unitIds: string[] } & typeof change;

describe('Update Ingredient: authorship', () => {
	beforeEach(async () => {
		ingredientsRepository = new IngredientsRepositoryInMemory();
		categoriesRepository = new CategoriesRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		service = new UpdateIngredientService(ingredientsRepository, categoriesRepository, unitsRepository);
		const seeded = await seedIngredient(
			{ categoriesRepository, unitsRepository, ingredientsRepository },
			creatorId,
		);
		ingredient = seeded.ingredient;
		request = { id: ingredient.id, categoryId: seeded.category.id, unitIds: [seeded.unit.id], ...change };
	});

	it.each([Roles.admin, Roles.owner])('lets the %s update an ingredient created by someone else', async (role) => {
		await service.execute(withActor(request, actorWithRole(role, 'editor-id')));

		expect(await ingredientsRepository.findById(ingredient.id)).toMatchObject({
			...change,
			createdBy: creatorId,
			updatedBy: 'editor-id',
		});
	});

	it('lets a partner update an ingredient they created, recording them as the last editor', async () => {
		await service.execute(withActor(request, actorWithRole(Roles.partner, creatorId)));

		expect(await ingredientsRepository.findById(ingredient.id)).toMatchObject({
			...change,
			createdBy: creatorId,
			updatedBy: creatorId,
		});
	});

	it('does not let a partner update an ingredient created by someone else, leaving it as it was', async () => {
		await expect(service.execute(withActor(request, actorWithRole(Roles.partner)))).rejects.toBeInstanceOf(
			ForbiddenError,
		);

		expect(await ingredientsRepository.findById(ingredient.id)).toEqual(ingredient);
	});

	it('does not let a partner update an ingredient whose creator closed the account', async () => {
		await ingredientsRepository.clearCreatorByUser(creatorId);

		await expect(
			service.execute(withActor(request, actorWithRole(Roles.partner, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('does not let a member update an ingredient, not even one that has their id as creator', async () => {
		await expect(
			service.execute(withActor(request, actorWithRole(Roles.member, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('reports a missing ingredient before checking who asks', async () => {
		await expect(
			service.execute(withActor({ ...request, id: '66b0000000000000000000ff' }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('refuses a partner before telling them the new name is taken', async () => {
		await ingredientsRepository.create({
			...createIngredientFactory(change),
			category: ingredient.category,
			units: ingredient.units,
			createdBy: creatorId,
		});

		await expect(service.execute(withActor(request, actorWithRole(Roles.partner)))).rejects.toBeInstanceOf(
			ForbiddenError,
		);
	});

	it('still reports a name that is taken to someone who may update the ingredient', async () => {
		await ingredientsRepository.create({
			...createIngredientFactory(change),
			category: ingredient.category,
			units: ingredient.units,
			createdBy: creatorId,
		});

		await expect(
			service.execute(withActor(request, actorWithRole(Roles.partner, creatorId))),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('does not take the creator or the last editor from the data of the request', async () => {
		await service.execute(
			withActor(
				{ ...request, createdBy: 'mallory', updatedBy: 'mallory' },
				actorWithRole(Roles.admin, 'editor-id'),
			),
		);

		expect(await ingredientsRepository.findById(ingredient.id)).toMatchObject({
			createdBy: creatorId,
			updatedBy: 'editor-id',
		});
	});
});
