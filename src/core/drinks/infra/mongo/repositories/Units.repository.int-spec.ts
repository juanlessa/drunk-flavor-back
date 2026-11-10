import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FACTORY_CREATOR_ID } from '@/core/drinks/factories/authorship.factories';
import { withEditor } from '@/core/drinks/factories/authorship.factories';
import { ObjectId } from 'mongodb';
import { UnitsRepository } from './Units.repository';
import { UnitModel } from '../entities/unit.model';
import { CreateUnit } from '@/core/drinks/dtos/unit.dtos';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';

const buildUnit = (name: { en: string; pt: string }): CreateUnit => ({
	createdBy: FACTORY_CREATOR_ID,
	translations: {
		en: { name: name.en, namePlural: `${name.en}s` },
		pt: { name: name.pt, namePlural: `${name.pt}s` },
	},
	allowDecimal: true,
	kind: 'volume',
});

let repository: UnitsRepository;

describe('UnitsRepository (integration)', () => {
	beforeAll(async () => {
		await UnitModel.init();
	});

	beforeEach(() => {
		repository = new UnitsRepository();
	});

	afterEach(async () => {
		await UnitModel.deleteMany({});
	});

	it('returns lean documents without __v', async () => {
		const created = await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));

		const byId = await repository.findById(created.id);
		const byName = await repository.findByName({ en: { name: 'milliliter' } });
		const [listed] = await repository.findAll({});

		expect(byId as Record<string, unknown>).not.toHaveProperty('__v');
		expect(byName as Record<string, unknown>).not.toHaveProperty('__v');
		expect(listed as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('finds by name across languages and returns null on no match', async () => {
		await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));

		expect(await repository.findByName({ en: { name: 'milliliter' } })).not.toBeNull();
		expect(await repository.findByName({ pt: { name: 'mililitro' } })).not.toBeNull();
		expect(await repository.findByName({ en: { name: 'nonexistent' } })).toBeNull();
	});

	it('throws NotFoundError on update/delete of a missing id and returns the updated doc on success', async () => {
		await expect(
			repository.update(withEditor({ id: new ObjectId().toString(), allowDecimal: false })),
		).rejects.toBeInstanceOf(NotFoundError);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));
		const updated = await repository.update(withEditor({ id: created.id, allowDecimal: false }));
		expect(updated.allowDecimal).toBe(false);
	});

	it('translates a sequential duplicate en/pt name create to ConflictError', async () => {
		await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));

		await expect(repository.create(buildUnit({ en: 'milliliter', pt: 'outro' }))).rejects.toBeInstanceOf(
			ConflictError,
		);
		await expect(repository.create(buildUnit({ en: 'other', pt: 'mililitro' }))).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('resolves a concurrent create race to one persisted doc and one domain rejection', async () => {
		const results = await Promise.allSettled([
			repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' })),
			repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' })),
		]);

		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
		expect(rejected).toHaveLength(1);
		expect(rejected[0].reason).toBeInstanceOf(ConflictError);

		expect(await UnitModel.countDocuments({ 'translations.en.name': 'milliliter' })).toBe(1);
	});

	it('translates an update rename collision to ConflictError', async () => {
		await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));
		const other = await repository.create(buildUnit({ en: 'centiliter', pt: 'centilitro' }));

		await expect(
			repository.update(withEditor({ id: other.id, translations: { en: { name: 'milliliter' } } })),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('orders findAll deterministically with the _id tie-breaker under equal sort keys', async () => {
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await UnitModel.collection.insertMany(
			ids.map((id, index) => ({
				_id: id,
				translations: {
					en: { name: `Unit ${index}`, namePlural: `Unit ${index}s` },
					pt: { name: `Unit PT ${index}`, namePlural: `Unit PT ${index}s` },
				},
				allowDecimal: true,
				kind: 'volume',
				created_at: sharedDate,
				updated_at: sharedDate,
			})),
		);

		const expectedOrder = [...ids].map((id) => id.toString()).sort((a, b) => (a > b ? -1 : 1));

		const firstPage = await repository.findAll({ page: 1, limit: 2, sort: { created_at: -1 } });
		const secondPage = await repository.findAll({ page: 2, limit: 2, sort: { created_at: -1 } });

		expect(firstPage.map((item) => item.id)).toEqual(expectedOrder.slice(0, 2));
		expect(secondPage.map((item) => item.id)).toEqual(expectedOrder.slice(2, 3));
	});

	it('succeeds with no sort supplied', async () => {
		await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));
		await expect(repository.findAll({})).resolves.toHaveLength(1);
	});

	describe('written with the ingredient name', () => {
		it('persists the flag and leaves it out of a unit that does not set it', async () => {
			const each = await repository.create({
				...buildUnit({ en: 'unit', pt: 'unidade' }),
				kind: 'count',
				allowDecimal: false,
				useIngredientName: true,
			});
			const plain = await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));

			expect((await repository.findById(each.id))?.useIngredientName).toBe(true);
			expect(await repository.findById(plain.id)).not.toHaveProperty('useIngredientName');
			const raw = await UnitModel.collection.findOne({ _id: new ObjectId(each.id) });
			expect(raw?.['use_ingredient_name']).toBe(true);
		});

		it('turns the flag off with false and keeps it when the update does not mention it', async () => {
			const created = await repository.create({
				...buildUnit({ en: 'unit', pt: 'unidade' }),
				kind: 'count',
				useIngredientName: true,
			});

			const untouched = await repository.update(withEditor({ id: created.id, allowDecimal: false }));
			const disabled = await repository.update(withEditor({ id: created.id, useIngredientName: false }));

			expect(untouched.useIngredientName).toBe(true);
			expect(disabled.useIngredientName).toBe(false);
		});
	});

	describe('ids and missing documents', () => {
		const invalidId = 'not-an-object-id';

		it('treats an id that is not an object id as a document that does not exist', async () => {
			expect(await repository.findById(invalidId)).toBeNull();
			await expect(repository.update(withEditor({ id: invalidId, allowDecimal: false }))).rejects.toBeInstanceOf(
				NotFoundError,
			);
			await expect(repository.delete(invalidId)).rejects.toBeInstanceOf(NotFoundError);
		});

		it('returns null for an id that is valid but does not exist', async () => {
			expect(await repository.findById(new ObjectId().toString())).toBeNull();
		});

		it.each([
			{ title: 'without touching the names or the symbol', data: { allowDecimal: false } },
			{
				title: 'while changing the names',
				data: { translations: { en: { name: 'Other', namePlural: 'Others' } } },
			},
			{ title: 'while changing the symbol', data: { symbol: 'ml' } },
		])('throws NotFoundError when updating a missing document {{title}}', async ({ data }) => {
			await expect(
				repository.update(withEditor({ id: new ObjectId().toString(), ...data })),
			).rejects.toBeInstanceOf(NotFoundError);
		});

		it('deletes the document and returns it', async () => {
			const created = await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));

			const deleted = await repository.delete(created.id);

			expect(deleted.id).toBe(created.id);
			expect(await repository.findById(created.id)).toBeNull();
			await expect(repository.delete(created.id)).rejects.toBeInstanceOf(NotFoundError);
		});
	});

	describe('symbol and search keys', () => {
		const rawSearchKeys = async (id: string) =>
			(await UnitModel.findById(id).select('+search_keys').lean())?.search_keys;

		const createWithSymbol = (symbol?: string) =>
			repository.create({ ...buildUnit({ en: 'liter', pt: 'litro' }), ...(symbol ? { symbol } : {}) });

		it('builds the keys from the names, the plural names and the symbol', async () => {
			const created = await createWithSymbol('L');

			expect(await rawSearchKeys(created.id)).toEqual(['liter', 'liters', 'litro', 'litros', 'l']);
			expect(created).not.toHaveProperty('searchKeys');
		});

		it('is found by its symbol, plural names and the name of the other language', async () => {
			await createWithSymbol('L');
			await repository.create({ ...buildUnit({ en: 'gram', pt: 'grama' }), symbol: 'g' });

			expect(await repository.findAll({ search: { name: 'l' } })).toHaveLength(1);
			expect(await repository.findAll({ search: { name: 'litros' } })).toHaveLength(1);
			expect(await repository.findAll({ search: { name: 'GRAMA' } })).toHaveLength(1);
			expect(await repository.findAll({ search: { name: 'g' } })).toHaveLength(1);
		});

		it('sets a symbol on a unit that had none', async () => {
			const created = await createWithSymbol();

			const updated = await repository.update(withEditor({ id: created.id, symbol: 'L' }));

			expect(updated.symbol).toBe('L');
			expect(await rawSearchKeys(created.id)).toEqual(['liter', 'liters', 'litro', 'litros', 'l']);
		});

		it('replaces the symbol and the keys follow', async () => {
			const created = await createWithSymbol('L');

			const updated = await repository.update(withEditor({ id: created.id, symbol: 'lt' }));

			expect(updated.symbol).toBe('lt');
			const keys = (await rawSearchKeys(created.id)) ?? [];
			expect(keys).toContain('lt');
			expect(keys).not.toContain('l');
		});

		it('removes the symbol with null, and the keys forget it', async () => {
			const created = await createWithSymbol('L');

			const updated = await repository.update(withEditor({ id: created.id, symbol: null }));

			expect(updated).not.toHaveProperty('symbol');
			expect(await UnitModel.collection.findOne({ _id: new ObjectId(created.id) })).not.toHaveProperty('symbol');
			expect(await rawSearchKeys(created.id)).toEqual(['liter', 'liters', 'litro', 'litros']);
		});

		it('keeps the symbol and the keys when the update does not mention them', async () => {
			const created = await createWithSymbol('L');
			const before = await rawSearchKeys(created.id);

			const updated = await repository.update(withEditor({ id: created.id, allowDecimal: false }));

			expect(updated.symbol).toBe('L');
			expect(updated.allowDecimal).toBe(false);
			expect(await rawSearchKeys(created.id)).toEqual(before);
		});

		it('keeps the symbol in the keys when only a name changes', async () => {
			const created = await createWithSymbol('L');

			await repository.update(
				withEditor({ id: created.id, translations: { en: { name: 'litre', namePlural: 'litres' } } }),
			);

			expect(await rawSearchKeys(created.id)).toEqual(['litre', 'litres', 'litro', 'litros', 'l']);
		});
	});
});
