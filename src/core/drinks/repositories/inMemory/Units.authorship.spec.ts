import { beforeEach } from 'vitest';
import { describeCatalogAuthorshipContract } from '@/core/drinks/repositories/testing/catalogAuthorship.contract';
import { UpdateUnit } from '@/core/drinks/dtos/unit.dtos';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from './Units.repository';

let repository: UnitsRepositoryInMemory;

beforeEach(() => {
	repository = new UnitsRepositoryInMemory();
});

describeCatalogAuthorshipContract({
	label: 'UnitsRepositoryInMemory',
	repository: () => repository,
	create: (name, createdBy) =>
		repository.create({
			...createUnitFactory({
				translations: {
					en: { name, namePlural: `${name}s` },
					pt: { name: `${name} pt`, namePlural: `${name}s pt` },
				},
			}),
			createdBy,
		}),
	update: (id, updatedBy, extra) => repository.update({ id, updatedBy, ...extra } as UpdateUnit),
});
