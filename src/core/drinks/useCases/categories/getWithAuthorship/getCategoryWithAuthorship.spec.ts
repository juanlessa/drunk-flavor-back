import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetCategoryWithAuthorshipService } from './GetCategoryWithAuthorship.service';

let repository: CategoriesRepositoryInMemory;
let service: GetCategoryWithAuthorshipService;

describe('Get Category With Authorship', () => {
	beforeEach(() => {
		repository = new CategoriesRepositoryInMemory();
		service = new GetCategoryWithAuthorshipService(repository);
	});

	it('gets a category showing who created and last edited it', async () => {
		const created = await repository.create(createCategoryFactory({ createdBy: 'creator-id' }));
		await repository.update({ id: created.id, updatedBy: 'editor-id' });

		const found = await service.execute({ id: created.id });

		expect(found).toMatchObject({ id: created.id, createdBy: 'creator-id', updatedBy: 'editor-id' });
	});

	it('gets a category whose creator closed the account, without an author', async () => {
		const created = await repository.create(createCategoryFactory({ createdBy: 'creator-id' }));
		await repository.clearCreatorByUser('creator-id');

		const found = await service.execute({ id: created.id });

		expect(found.id).toBe(created.id);
		expect(found).not.toHaveProperty('createdBy');
	});

	it('rejects a nonexistent category', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(NotFoundError);
	});
});
