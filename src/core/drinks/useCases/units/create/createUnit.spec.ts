import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateUnitService } from './CreateUnit.service';

let repository: UnitsRepositoryInMemory;
let service: CreateUnitService;

describe('Create Unit', () => {
	beforeEach(() => {
		repository = new UnitsRepositoryInMemory();
		service = new CreateUnitService(repository);
	});

	it('creates a unit with all fields and preserves false booleans', async () => {
		const data = createUnitFactory({ symbol: 'mL', spaceBeforeSymbol: false, allowDecimal: false });
		await service.execute(data);
		const unit = await repository.findByName(data.translations);
		expect(unit).toMatchObject({ symbol: 'mL', spaceBeforeSymbol: false, allowDecimal: false, kind: 'volume' });
	});

	it('creates a unit with optional fields omitted', async () => {
		const data = createUnitFactory();
		await service.execute(data);
		const unit = await repository.findByName(data.translations);
		expect(unit).not.toHaveProperty('symbol');
		expect(unit).not.toHaveProperty('spaceBeforeSymbol');
	});

	it.each([
		['English', { en: { name: 'milliliter' }, pt: { name: 'unidade portuguesa exclusiva' } }],
		['Portuguese', { en: { name: 'unique english unit' }, pt: { name: 'mililitro' } }],
	] as const)('rejects a duplicate name in %s only', async (_, translations) => {
		await repository.create(createUnitFactory());
		await expect(service.execute(createUnitFactory({ translations }))).rejects.toBeInstanceOf(BadRequestError);
	});
});
