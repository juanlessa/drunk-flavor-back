import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { UnitsRepository } from './Units.repository';
import { UnitModel } from '../entities/unit.model';
import { CreateUnit } from '@/core/drinks/dtos/unit.dtos';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

const buildUnit = (name: { en: string; pt: string }): CreateUnit => ({
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
		await expect(repository.update({ id: new ObjectId().toString(), allowDecimal: false })).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));
		const updated = await repository.update({ id: created.id, allowDecimal: false });
		expect(updated.allowDecimal).toBe(false);
	});

	it('translates a sequential duplicate en/pt name create to BadRequestError', async () => {
		await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));

		await expect(repository.create(buildUnit({ en: 'milliliter', pt: 'outro' }))).rejects.toBeInstanceOf(
			BadRequestError,
		);
		await expect(repository.create(buildUnit({ en: 'other', pt: 'mililitro' }))).rejects.toBeInstanceOf(
			BadRequestError,
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
		expect(rejected[0].reason).toBeInstanceOf(BadRequestError);

		expect(await UnitModel.countDocuments({ 'translations.en.name': 'milliliter' })).toBe(1);
	});

	it('translates an update rename collision to BadRequestError', async () => {
		await repository.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));
		const other = await repository.create(buildUnit({ en: 'centiliter', pt: 'centilitro' }));

		await expect(
			repository.update({ id: other.id, translations: { en: { name: 'milliliter' } } }),
		).rejects.toBeInstanceOf(BadRequestError);
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
});
