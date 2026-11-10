import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actorWithRole, withActor } from '@/core/drinks/factories/authorship.factories';
import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { createDrinkFactory, createDrinkIngredientInputFactory } from '@/core/drinks/factories/drink.factories';
import { ConflictError, ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { UpdateDrinkService } from './UpdateDrink.service';

const creatorId = '66b0000000000000000000a1';
const { translations: changedTranslations } = createDrinkFactory({
	translations: {
		en: { name: 'Cosmopolitan', method: 'Shake' },
		pt: { name: 'Cosmopolitan', method: 'Agite' },
	},
});

let drinksRepository: DrinksRepositoryInMemory;
let service: UpdateDrinkService;
let drink: Drink;
let request: {
	id: string;
	translations: typeof changedTranslations;
	ingredients: ReturnType<typeof createDrinkIngredientInputFactory>[];
	garnishes: [];
};

describe('Update Drink: authorship', () => {
	beforeEach(async () => {
		drinksRepository = new DrinksRepositoryInMemory();
		const ingredientsRepository = new IngredientsRepositoryInMemory();
		service = new UpdateDrinkService(drinksRepository, ingredientsRepository);
		const seeded = await seedDrink(
			{
				categoriesRepository: new CategoriesRepositoryInMemory(),
				unitsRepository: new UnitsRepositoryInMemory(),
				ingredientsRepository,
				drinksRepository,
			},
			creatorId,
		);
		drink = seeded.drink;
		request = {
			id: drink.id,
			translations: changedTranslations,
			ingredients: [createDrinkIngredientInputFactory(seeded.ingredient.id, { unitId: seeded.unit.id })],
			garnishes: [],
		};
	});

	it.each([Roles.admin, Roles.owner])('lets the %s update a drink created by someone else', async (role) => {
		await service.execute(withActor(request, actorWithRole(role, 'editor-id')));

		expect(await drinksRepository.findById(drink.id)).toMatchObject({
			translations: changedTranslations,
			createdBy: creatorId,
			updatedBy: 'editor-id',
		});
	});

	it('lets a partner update a drink they created, recording them as the last editor', async () => {
		await service.execute(withActor(request, actorWithRole(Roles.partner, creatorId)));

		expect(await drinksRepository.findById(drink.id)).toMatchObject({ createdBy: creatorId, updatedBy: creatorId });
	});

	it('does not let a partner update a drink created by someone else, leaving it as it was', async () => {
		await expect(service.execute(withActor(request, actorWithRole(Roles.partner)))).rejects.toBeInstanceOf(
			ForbiddenError,
		);

		expect(await drinksRepository.findById(drink.id)).toEqual(drink);
	});

	it('does not let a partner update a drink whose creator closed the account', async () => {
		await drinksRepository.clearCreatorByUser(creatorId);

		await expect(
			service.execute(withActor(request, actorWithRole(Roles.partner, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('does not let a member update a drink, not even one that has their id as creator', async () => {
		await expect(
			service.execute(withActor(request, actorWithRole(Roles.member, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('reports a missing drink before checking who asks', async () => {
		await expect(
			service.execute(withActor({ ...request, id: '66b0000000000000000000ff' }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('refuses a partner before telling them the new name is taken', async () => {
		await drinksRepository.create({
			translations: changedTranslations,
			ingredients: drink.ingredients,
			createdBy: creatorId,
		});

		await expect(service.execute(withActor(request, actorWithRole(Roles.partner)))).rejects.toBeInstanceOf(
			ForbiddenError,
		);
	});

	it('still reports a name that is taken to someone who may update the drink', async () => {
		await drinksRepository.create({
			translations: changedTranslations,
			ingredients: drink.ingredients,
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

		expect(await drinksRepository.findById(drink.id)).toMatchObject({
			createdBy: creatorId,
			updatedBy: 'editor-id',
		});
	});
});
