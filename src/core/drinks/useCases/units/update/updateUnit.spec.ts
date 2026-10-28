import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUnitService } from './UpdateUnit.service';

let repository: UnitsRepositoryInMemory;
let service: UpdateUnitService;

describe('Update Unit', () => {
	beforeEach(() => {
		repository = new UnitsRepositoryInMemory();
		service = new UpdateUnitService(repository);
	});
	it('updates all unit fields and preserves false', async () => {
		const created = await repository.create(createUnitFactory());
		const update = createUnitFactory({
			translations: { en: { name: 'gram', namePlural: 'grams' }, pt: { name: 'grama', namePlural: 'gramas' } },
			symbol: 'g',
			spaceBeforeSymbol: false,
			allowDecimal: false,
			kind: 'mass',
		});
		await service.execute({ id: created.id, ...update });
		expect(await repository.findById(created.id)).toMatchObject(update);
	});
	it('updates with optional fields omitted without manufacturing them', async () => {
		const created = await repository.create(createUnitFactory());
		const update = createUnitFactory({ kind: 'count' });
		await service.execute({ id: created.id, ...update });
		const found = await repository.findById(created.id);
		expect(found).not.toHaveProperty('symbol');
		expect(found).not.toHaveProperty('spaceBeforeSymbol');
	});
	it('keeps the current symbol when symbol is omitted', async () => {
		const created = await repository.create(createUnitFactory({ symbol: 'ml' }));
		await service.execute({ id: created.id, ...createUnitFactory() });

		expect((await repository.findById(created.id))?.symbol).toBe('ml');
	});

	it('removes the symbol when symbol is null', async () => {
		const created = await repository.create(createUnitFactory({ symbol: 'ml' }));
		await service.execute({ id: created.id, ...createUnitFactory(), symbol: null });

		expect(await repository.findById(created.id)).not.toHaveProperty('symbol');
	});

	it('rejects a nonexistent unit', async () => {
		await expect(service.execute({ id: new ObjectId().toString(), ...createUnitFactory() })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});
	it.each([
		['English', { en: { name: 'gram' }, pt: { name: 'unidade portuguesa exclusiva' } }],
		['Portuguese', { en: { name: 'unique english unit' }, pt: { name: 'grama' } }],
	] as const)('rejects another unit name duplicated in %s only', async (_, translations) => {
		const first = await repository.create(createUnitFactory());
		await repository.create(
			createUnitFactory({
				translations: { en: { name: 'gram' }, pt: { name: 'grama' } },
				kind: 'mass',
			}),
		);
		const update = createUnitFactory({ translations, kind: 'mass' });
		await expect(service.execute({ id: first.id, ...update })).rejects.toBeInstanceOf(BadRequestError);
	});
});
