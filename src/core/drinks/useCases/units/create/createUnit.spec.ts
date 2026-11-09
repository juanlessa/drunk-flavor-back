import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { BadRequestError, ConflictError } from '@/shared/error/error.lib';
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

	describe('written with the ingredient name', () => {
		it('creates a count unit without a symbol that is written with the ingredient name', async () => {
			const data = createUnitFactory({ kind: 'count', allowDecimal: false, useIngredientName: true });
			await service.execute(data);
			expect(await repository.findByName(data.translations)).toMatchObject({
				kind: 'count',
				useIngredientName: true,
			});
		});

		it('does not manufacture the flag on a unit that omits it', async () => {
			const data = createUnitFactory();
			await service.execute(data);
			expect(await repository.findByName(data.translations)).not.toHaveProperty('useIngredientName');
		});

		it.each([
			{ title: 'is not a count unit', unit: { kind: 'volume' } },
			{ title: 'has a symbol', unit: { kind: 'count', symbol: 'u' } },
		] as const)('rejects a unit that $title', async ({ unit }) => {
			await expect(
				service.execute(createUnitFactory({ ...unit, useIngredientName: true })),
			).rejects.toBeInstanceOf(BadRequestError);
			expect(await repository.findAll({})).toHaveLength(0);
		});
	});

	it.each([
		['English', { en: { name: 'milliliter' }, pt: { name: 'unidade portuguesa exclusiva' } }],
		['Portuguese', { en: { name: 'unique english unit' }, pt: { name: 'mililitro' } }],
	] as const)('rejects a duplicate name in %s only', async (_, translations) => {
		await repository.create(createUnitFactory());
		await expect(service.execute(createUnitFactory({ translations }))).rejects.toBeInstanceOf(ConflictError);
	});
});
