import { beforeEach, describe, expect, it } from 'vitest';
import { actorWithRole, withActor } from '@/core/drinks/factories/authorship.factories';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { Roles } from '@/shared/accessControl/roles';
import { CreateCategoryService } from './CreateCategory.service';

let repository: CategoriesRepositoryInMemory;
let service: CreateCategoryService;

describe('Create Category: authorship', () => {
	beforeEach(() => {
		repository = new CategoriesRepositoryInMemory();
		service = new CreateCategoryService(repository);
	});

	it.each([Roles.partner, Roles.admin, Roles.owner])(
		'records the %s as the creator and the last editor',
		async (role) => {
			const actor = actorWithRole(role, 'creator-id');

			const created = await service.execute(withActor(createCategoryFactory(), actor));

			expect(created).toMatchObject({ createdBy: 'creator-id', updatedBy: 'creator-id' });
			expect(await repository.findById(created.id)).toMatchObject({
				createdBy: 'creator-id',
				updatedBy: 'creator-id',
			});
		},
	);

	it('does not take the creator from the data of the request', async () => {
		const data = { ...createCategoryFactory(), createdBy: 'someone-else', updatedBy: 'someone-else' };

		const created = await service.execute(withActor(data, actorWithRole(Roles.partner, 'creator-id')));

		expect(created).toMatchObject({ createdBy: 'creator-id', updatedBy: 'creator-id' });
	});
});
