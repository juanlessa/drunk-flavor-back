import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteUnitService } from './DeleteUnit.service';

let repository: UnitsRepositoryInMemory;
let service: DeleteUnitService;

describe('Delete Unit', () => {
	beforeEach(() => {
		repository = new UnitsRepositoryInMemory();
		service = new DeleteUnitService(repository);
	});
	it('deletes an existing unit', async () => {
		const created = await repository.create(createUnitFactory());
		await service.execute({ id: created._id.toString() });
		expect(await repository.findById(created._id.toString())).toBeNull();
	});
	it('rejects a nonexistent unit', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(BadRequestError);
	});
});
