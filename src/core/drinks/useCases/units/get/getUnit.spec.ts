import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetUnitService } from './GetUnit.service';

let repository: UnitsRepositoryInMemory;
let service: GetUnitService;

describe('Get Unit', () => {
	beforeEach(() => {
		repository = new UnitsRepositoryInMemory();
		service = new GetUnitService(repository);
	});
	it('gets an existing unit', async () => {
		const created = await repository.create(createUnitFactory());
		const found = await service.execute({ id: created.id });
		expect(found).toMatchObject({ id: created.id, translations: created.translations });
		expect(found).not.toHaveProperty('createdBy');
		expect(found).not.toHaveProperty('updatedBy');
	});
	it('rejects a nonexistent unit', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(NotFoundError);
	});
});
