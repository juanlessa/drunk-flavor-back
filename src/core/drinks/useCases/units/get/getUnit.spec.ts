import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { BadRequestError } from '@/shared/error/error.lib';
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
		expect(await service.execute({ id: created._id.toString() })).toEqual(created);
	});
	it('rejects a nonexistent unit', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(BadRequestError);
	});
});
