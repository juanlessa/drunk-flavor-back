import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateUnit } from '@/core/drinks/dtos/unit.dtos';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { NotFoundError } from '@/shared/error/error.lib';
import { UnitsRepositoryInMemory } from './Units.repository';

const buildUnit = (
	names: { en: string; enPlural: string; pt: string; ptPlural: string },
	extra: Partial<CreateUnit> = {},
): CreateUnit =>
	createUnitFactory({
		translations: {
			en: { name: names.en, namePlural: names.enPlural },
			pt: { name: names.pt, namePlural: names.ptPlural },
		},
		...extra,
	});

const milliliter = { en: 'milliliter', enPlural: 'milliliters', pt: 'mililitro', ptPlural: 'mililitros' };
const gram = { en: 'gram', enPlural: 'grams', pt: 'grama', ptPlural: 'gramas' };
const leaf = { en: 'leaf', enPlural: 'leaves', pt: 'folha', ptPlural: 'folhas' };

let repository: UnitsRepositoryInMemory;

describe('UnitsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new UnitsRepositoryInMemory();
	});

	it('assigns an id and the timestamps when creating, keeping the given data', async () => {
		const created = await repository.create(
			buildUnit(milliliter, { symbol: 'ml', spaceBeforeSymbol: false, allowDecimal: true, kind: 'volume' }),
		);

		expect(created.id).toEqual(expect.any(String));
		expect(created.createdAt).toBeInstanceOf(Date);
		expect(created.updatedAt).toBeInstanceOf(Date);
		expect(created).toMatchObject({ symbol: 'ml', spaceBeforeSymbol: false, allowDecimal: true, kind: 'volume' });
	});

	it('finds a unit by id and returns null for an unknown id', async () => {
		const created = await repository.create(buildUnit(milliliter));

		expect(await repository.findById(created.id)).toBe(created);
		expect(await repository.findById(new ObjectId().toString())).toBeNull();
	});

	describe('findByName', () => {
		beforeEach(async () => {
			await repository.create(buildUnit(milliliter));
		});

		it('finds a unit by the name of either language, ignoring case and accents', async () => {
			expect(await repository.findByName({ en: { name: 'Milliliter' } })).not.toBeNull();
			expect(await repository.findByName({ pt: { name: 'MILILITRO' } })).not.toBeNull();
			expect(await repository.findByName({ pt: { name: 'mililítro' } })).not.toBeNull();
		});

		it('does not match a plural name or an unknown name', async () => {
			expect(await repository.findByName({ en: { name: 'milliliters' } })).toBeNull();
			expect(await repository.findByName({ en: { name: 'gram' } })).toBeNull();
		});
	});

	describe('update', () => {
		it('throws NotFoundError for a missing id', async () => {
			await expect(
				repository.update({ id: new ObjectId().toString(), allowDecimal: false }),
			).rejects.toBeInstanceOf(NotFoundError);
		});

		it('deep-merges the data, keeps the other fields and refreshes updatedAt', async () => {
			const created = await repository.create(buildUnit(milliliter, { symbol: 'ml' }));
			const originalUpdatedAt = created.updatedAt.getTime();

			const updated = await repository.update({
				id: created.id,
				translations: { en: { name: 'millilitre' } },
				allowDecimal: false,
			});

			expect(updated.translations.en).toEqual({ name: 'millilitre', namePlural: 'milliliters' });
			expect(updated.translations.pt.name).toBe('mililitro');
			expect(updated.allowDecimal).toBe(false);
			expect(updated.symbol).toBe('ml');
			expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
			expect(await repository.findById(created.id)).toEqual(updated);
		});

		it('sets, replaces, keeps and removes the symbol', async () => {
			const created = await repository.create(buildUnit(milliliter));

			expect((await repository.update({ id: created.id, symbol: 'ml' })).symbol).toBe('ml');
			expect((await repository.update({ id: created.id, symbol: 'mL' })).symbol).toBe('mL');
			expect((await repository.update({ id: created.id, allowDecimal: false })).symbol).toBe('mL');

			const removed = await repository.update({ id: created.id, symbol: null });
			expect(removed).not.toHaveProperty('symbol');
		});

		it('sets, keeps and turns off the flag that writes the unit with the ingredient name', async () => {
			const created = await repository.create(buildUnit(leaf, { kind: 'count', allowDecimal: false }));
			expect(created).not.toHaveProperty('useIngredientName');

			const enabled = await repository.update({ id: created.id, useIngredientName: true });
			const untouched = await repository.update({ id: created.id, allowDecimal: false });
			const disabled = await repository.update({ id: created.id, useIngredientName: false });

			expect(enabled.useIngredientName).toBe(true);
			expect(untouched.useIngredientName).toBe(true);
			expect(disabled.useIngredientName).toBe(false);
		});

		it('sets the spacing of the symbol and keeps false', async () => {
			const created = await repository.create(buildUnit(milliliter, { spaceBeforeSymbol: true }));

			const unspaced = await repository.update({ id: created.id, spaceBeforeSymbol: false });
			const untouched = await repository.update({ id: created.id, allowDecimal: true });

			expect(unspaced.spaceBeforeSymbol).toBe(false);
			expect(untouched.spaceBeforeSymbol).toBe(false);
		});
	});

	describe('delete', () => {
		it('throws NotFoundError for a missing id', async () => {
			await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
		});

		it('removes the unit and returns it', async () => {
			const created = await repository.create(buildUnit(milliliter));
			await repository.create(buildUnit(gram));

			const deleted = await repository.delete(created.id);

			expect(deleted.id).toBe(created.id);
			expect(await repository.findById(created.id)).toBeNull();
			expect(await repository.findAll({})).toHaveLength(1);
		});
	});

	describe('findAll', () => {
		const namesOf = async (query: Parameters<UnitsRepositoryInMemory['findAll']>[0]) =>
			(await repository.findAll(query)).map(({ translations }) => translations.en.name);

		beforeEach(async () => {
			await repository.create(buildUnit(milliliter, { symbol: 'ml' }));
			await repository.create(buildUnit(gram, { symbol: 'g', kind: 'mass' }));
			await repository.create(buildUnit(leaf, { kind: 'count', allowDecimal: false }));
		});

		it('returns every unit when nothing is asked', async () => {
			expect(await namesOf({})).toEqual(['milliliter', 'gram', 'leaf']);
		});

		it('searches by the singular and plural names of either language, ignoring case and accents', async () => {
			expect(await namesOf({ search: { name: 'MILILÍTROS' } })).toEqual(['milliliter']);
			expect(await namesOf({ search: { name: 'leaves' } })).toEqual(['leaf']);
			expect(await namesOf({ search: { name: 'grama' } })).toEqual(['gram']);
			expect(await namesOf({ search: { name: 'xyz' } })).toEqual([]);
		});

		it('searches by the symbol', async () => {
			expect(await namesOf({ search: { name: 'ml' } })).toEqual(['milliliter']);
			expect(await namesOf({ search: { name: 'G' } })).toEqual(['gram']);
		});

		it('sorts, then paginates', async () => {
			expect(await namesOf({ sort: { 'translations.en.name': 'desc' } })).toEqual(['milliliter', 'leaf', 'gram']);
			expect(await namesOf({ sort: { 'translations.en.name': 'asc' }, limit: 2, page: 1 })).toEqual([
				'gram',
				'leaf',
			]);
			expect(await namesOf({ sort: { 'translations.en.name': 'asc' }, limit: 2, page: 2 })).toEqual([
				'milliliter',
			]);
		});
	});
});
