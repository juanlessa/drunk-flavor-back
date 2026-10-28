import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CategoriesRepository } from './Categories.repository';
import { CategoryModel } from '../entities/category.model';
import { CreateCategory } from '@/core/drinks/dtos/category.dtos';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

const buildCategory = (name: { en: string; pt: string }): CreateCategory => ({
	translations: { en: { name: name.en }, pt: { name: name.pt } },
	isAlcoholic: false,
});

let repository: CategoriesRepository;

describe('CategoriesRepository (integration)', () => {
	beforeAll(async () => {
		await CategoryModel.init();
	});

	beforeEach(() => {
		repository = new CategoriesRepository();
	});

	afterEach(async () => {
		await CategoryModel.deleteMany({});
	});

	it('returns lean documents without __v', async () => {
		const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

		const byId = await repository.findById(created.id);
		const byName = await repository.findByName({ en: { name: 'Citrus' } });
		const [listed] = await repository.findAll({});

		expect(byId as Record<string, unknown>).not.toHaveProperty('__v');
		expect(byName as Record<string, unknown>).not.toHaveProperty('__v');
		expect(listed as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('finds by name across languages and returns null on no match', async () => {
		await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

		expect(await repository.findByName({ en: { name: 'Citrus' } })).not.toBeNull();
		expect(await repository.findByName({ pt: { name: 'Cítrico' } })).not.toBeNull();
		expect(await repository.findByName({ en: { name: 'Nonexistent' } })).toBeNull();
	});

	it('throws NotFoundError on update/delete of a missing id and returns the updated doc on success', async () => {
		await expect(repository.update({ id: new ObjectId().toString(), isAlcoholic: true })).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
		const updated = await repository.update({ id: created.id, isAlcoholic: true });
		expect(updated.isAlcoholic).toBe(true);
	});

	it('translates a sequential duplicate en/pt name create to BadRequestError', async () => {
		await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

		await expect(repository.create(buildCategory({ en: 'Citrus', pt: 'Outro' }))).rejects.toBeInstanceOf(
			BadRequestError,
		);
		await expect(repository.create(buildCategory({ en: 'Other', pt: 'Cítrico' }))).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});

	it('resolves a concurrent create race to one persisted doc and one domain rejection', async () => {
		const results = await Promise.allSettled([
			repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' })),
			repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' })),
		]);

		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
		expect(rejected).toHaveLength(1);
		expect(rejected[0].reason).toBeInstanceOf(BadRequestError);

		expect(await CategoryModel.countDocuments({ 'translations.en.name': 'Citrus' })).toBe(1);
	});

	it('translates an update rename collision to BadRequestError', async () => {
		await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
		const other = await repository.create(buildCategory({ en: 'Herbal', pt: 'Herbal' }));

		await expect(
			repository.update({ id: other.id, translations: { en: { name: 'Citrus' } } }),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('orders findAll deterministically with the _id tie-breaker under equal sort keys', async () => {
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await CategoryModel.collection.insertMany(
			ids.map((id, index) => ({
				_id: id,
				translations: { en: { name: `Cat ${index}` }, pt: { name: `Cat PT ${index}` } },
				isAlcoholic: false,
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
		await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
		await expect(repository.findAll({})).resolves.toHaveLength(1);
	});
});
