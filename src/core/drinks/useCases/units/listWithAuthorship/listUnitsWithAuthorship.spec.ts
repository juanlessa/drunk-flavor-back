import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListUnitsWithAuthorshipService } from './ListUnitsWithAuthorship.service';

const partner: Actor = { id: 'partner-id', role: Roles.partner };
const named = (name: string, createdBy: string) =>
	createUnitFactory({
		createdBy,
		translations: { en: { name, namePlural: `${name}s` }, pt: { name: `${name} pt`, namePlural: `${name}s pt` } },
	});

let repository: UnitsRepositoryInMemory;
let service: ListUnitsWithAuthorshipService;

describe('List Units With Authorship', () => {
	beforeEach(() => {
		repository = new UnitsRepositoryInMemory();
		service = new ListUnitsWithAuthorshipService(repository);
	});

	it('lists the units of the actor first, then the others, each group in the order of the query', async () => {
		await repository.create(named('a', 'other-id'));
		await repository.create(named('b', partner.id));
		await repository.create(named('c', 'other-id'));
		await repository.create(named('d', partner.id));

		const units = await service.execute({ actor: partner, query: { sort: { 'translations.en.name': 'desc' } } });

		expect(units.map((unit) => unit.translations.en.name)).toEqual(['d', 'b', 'c', 'a']);
	});

	it('shows who created and last edited each unit', async () => {
		await repository.create(named('a', partner.id));

		const [unit] = await service.execute({ actor: partner });

		expect(unit).toMatchObject({ createdBy: partner.id, updatedBy: partner.id });
	});

	it('paginates after putting the units of the actor first', async () => {
		await repository.create(named('a', 'other-id'));
		await repository.create(named('b', partner.id));
		await repository.create(named('c', 'other-id'));

		const units = await service.execute({ actor: partner, query: { limit: 2, page: 1 } });

		expect(units.map((unit) => unit.translations.en.name)).toEqual(['b', 'a']);
	});
});
