import { beforeEach, describe, expect, it } from 'vitest';
import { actorWithRole, withActor, withCreator } from '@/core/drinks/factories/authorship.factories';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { DeleteCategoryService } from './DeleteCategory.service';

const creatorId = '66b0000000000000000000a1';

let repository: CategoriesRepositoryInMemory;
let service: DeleteCategoryService;

describe('Delete Category: authorship', () => {
	beforeEach(() => {
		repository = new CategoriesRepositoryInMemory();
		service = new DeleteCategoryService(repository);
	});

	it.each([Roles.admin, Roles.owner])('lets the %s delete a category created by someone else', async (role) => {
		const category = await repository.create(withCreator(createCategoryFactory(), creatorId));

		await service.execute(withActor({ id: category.id }, actorWithRole(role)));

		expect(await repository.findById(category.id)).toBeNull();
	});

	it('lets a partner delete a category they created', async () => {
		const category = await repository.create(withCreator(createCategoryFactory(), creatorId));

		await service.execute(withActor({ id: category.id }, actorWithRole(Roles.partner, creatorId)));

		expect(await repository.findById(category.id)).toBeNull();
	});

	it('does not let a partner delete a category created by someone else', async () => {
		const category = await repository.create(withCreator(createCategoryFactory(), creatorId));

		await expect(
			service.execute(withActor({ id: category.id }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(ForbiddenError);
		expect(await repository.findById(category.id)).not.toBeNull();
	});

	it('does not let a partner delete a category whose creator closed the account', async () => {
		const category = await repository.create(withCreator(createCategoryFactory(), creatorId));
		await repository.clearCreatorByUser(creatorId);

		await expect(
			service.execute(withActor({ id: category.id }, actorWithRole(Roles.partner, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
		expect(await repository.findById(category.id)).not.toBeNull();
	});

	it('does not let a member delete a category, not even one that has their id as creator', async () => {
		const category = await repository.create(withCreator(createCategoryFactory(), creatorId));

		await expect(
			service.execute(withActor({ id: category.id }, actorWithRole(Roles.member, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('reports a missing category before checking who asks', async () => {
		await expect(
			service.execute(withActor({ id: '66b0000000000000000000ff' }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
