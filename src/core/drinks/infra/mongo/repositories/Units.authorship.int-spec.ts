import { beforeAll } from 'vitest';
import { describeCatalogAuthorshipContract } from '@/core/drinks/repositories/testing/catalogAuthorship.contract';
import { UpdateUnit } from '@/core/drinks/dtos/unit.dtos';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitModel } from '../entities/unit.model';
import { UnitsRepository } from './Units.repository';

const repository = new UnitsRepository();

beforeAll(async () => {
	await UnitModel.init();
});

describeCatalogAuthorshipContract({
	label: 'UnitsRepository',
	reset: async () => {
		await UnitModel.deleteMany({});
	},
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
