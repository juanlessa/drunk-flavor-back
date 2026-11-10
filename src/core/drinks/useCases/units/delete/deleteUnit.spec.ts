import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { ForbiddenError } from '@/shared/error/error.lib';
import { withActor } from '@/core/drinks/factories/authorship.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { NotFoundError } from '@/shared/error/error.lib';
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
		await service.execute(withActor({ id: created.id }));
		expect(await repository.findById(created.id)).toBeNull();
	});
	it('rejects a nonexistent unit', async () => {
		await expect(service.execute(withActor({ id: new ObjectId().toString() }))).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});

	it('does not let a partner delete a unit created by someone else', async () => {
		const created = await repository.create(createUnitFactory());

		await expect(
			service.execute(withActor({ id: created.id }, { id: '66b0000000000000000000b2', role: 'partner' })),
		).rejects.toBeInstanceOf(ForbiddenError);
		expect(await repository.findById(created.id)).not.toBeNull();
	});

	it('lets a partner delete a unit they created', async () => {
		const partner = { id: '66b0000000000000000000b2', role: 'partner' } as const;
		const created = await repository.create(createUnitFactory({ createdBy: partner.id }));

		await service.execute(withActor({ id: created.id }, partner));

		expect(await repository.findById(created.id)).toBeNull();
	});
});
