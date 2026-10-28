import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListUnitsService } from './ListUnits.service';

let repository: UnitsRepositoryInMemory;
let service: ListUnitsService;
const units = [
	createUnitFactory({
		translations: { en: { name: 'cup', namePlural: 'cups' }, pt: { name: 'xícara', namePlural: 'xícaras' } },
		kind: 'volume',
	}),
	createUnitFactory({
		translations: { en: { name: 'gram', namePlural: 'grams' }, pt: { name: 'grama', namePlural: 'gramas' } },
		kind: 'mass',
	}),
	createUnitFactory({
		translations: {
			en: { name: 'piece', namePlural: 'pieces' },
			pt: { name: 'unidade', namePlural: 'unidades' },
		},
		kind: 'count',
	}),
];

describe('List Units', () => {
	beforeEach(async () => {
		repository = new UnitsRepositoryInMemory();
		service = new ListUnitsService(repository);
		await Promise.all(units.map((unit) => repository.create(unit)));
	});
	it('lists units with defaults', async () =>
		expect((await service.execute({})).length).toBeLessThanOrEqual(DEFAULT_QUERY_PARAMS.limit));
	it('paginates units', async () => expect(await service.execute({ query: { page: 2, limit: 2 } })).toHaveLength(1));
	it('searches translated singular names', async () =>
		expect(await service.execute({ query: { search: { 'translations.en.name': 'gram' } } })).toHaveLength(1));
	it('searches translated plural names', async () =>
		expect(await service.execute({ query: { search: { 'translations.en.namePlural': 'pieces' } } })).toHaveLength(
			1,
		));
	it('sorts translated plural names', async () => {
		const found = await service.execute({ query: { sort: { 'translations.en.namePlural': -1 } } });
		expect(found.map((unit) => unit.translations.en.name)).toEqual(['piece', 'gram', 'cup']);
	});
});
