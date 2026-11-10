import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetUnitWithAuthorshipService } from './GetUnitWithAuthorship.service';

let repository: UnitsRepositoryInMemory;
let service: GetUnitWithAuthorshipService;

describe('Get Unit With Authorship', () => {
	beforeEach(() => {
		repository = new UnitsRepositoryInMemory();
		service = new GetUnitWithAuthorshipService(repository);
	});

	it('gets a unit showing who created and last edited it', async () => {
		const created = await repository.create(createUnitFactory({ createdBy: 'creator-id' }));
		await repository.update({ id: created.id, updatedBy: 'editor-id' });

		const found = await service.execute({ id: created.id });

		expect(found).toMatchObject({ id: created.id, createdBy: 'creator-id', updatedBy: 'editor-id' });
	});

	it('gets a unit whoever created it', async () => {
		const first = await repository.create(createUnitFactory({ createdBy: 'one' }));
		const second = await repository.create(
			createUnitFactory({
				createdBy: 'two',
				translations: {
					en: { name: 'gram', namePlural: 'grams' },
					pt: { name: 'grama', namePlural: 'gramas' },
				},
			}),
		);

		expect(await service.execute({ id: first.id })).toMatchObject({ createdBy: 'one' });
		expect(await service.execute({ id: second.id })).toMatchObject({ createdBy: 'two' });
	});

	it('gets a unit whose creator closed the account, without an author', async () => {
		const created = await repository.create(createUnitFactory({ createdBy: 'creator-id' }));
		await repository.clearCreatorByUser('creator-id');

		const found = await service.execute({ id: created.id });

		expect(found.id).toBe(created.id);
		expect(found).not.toHaveProperty('createdBy');
	});

	it('rejects a nonexistent unit', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(NotFoundError);
	});
});
