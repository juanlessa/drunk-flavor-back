import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FACTORY_CREATOR_ID } from '@/core/drinks/factories/authorship.factories';
import { withEditor } from '@/core/drinks/factories/authorship.factories';
import { ObjectId } from 'mongodb';
import { CategoriesRepository } from './Categories.repository';
import { CategoryModel } from '../entities/category.model';
import { CreateCategory } from '@/core/drinks/dtos/category.dtos';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';

const buildCategory = (name: { en: string; pt: string }): CreateCategory => ({
	createdBy: FACTORY_CREATOR_ID,
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
		await expect(
			repository.update(withEditor({ id: new ObjectId().toString(), isAlcoholic: true })),
		).rejects.toBeInstanceOf(NotFoundError);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
		const updated = await repository.update(withEditor({ id: created.id, isAlcoholic: true }));
		expect(updated.isAlcoholic).toBe(true);
	});

	it('translates a sequential duplicate en/pt name create to ConflictError', async () => {
		await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

		await expect(repository.create(buildCategory({ en: 'Citrus', pt: 'Outro' }))).rejects.toBeInstanceOf(
			ConflictError,
		);
		await expect(repository.create(buildCategory({ en: 'Other', pt: 'Cítrico' }))).rejects.toBeInstanceOf(
			ConflictError,
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
		expect(rejected[0].reason).toBeInstanceOf(ConflictError);

		expect(await CategoryModel.countDocuments({ 'translations.en.name': 'Citrus' })).toBe(1);
	});

	it('translates an update rename collision to ConflictError', async () => {
		await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
		const other = await repository.create(buildCategory({ en: 'Herbal', pt: 'Herbal' }));

		await expect(
			repository.update(withEditor({ id: other.id, translations: { en: { name: 'Citrus' } } })),
		).rejects.toBeInstanceOf(ConflictError);
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

	describe('ids and missing documents', () => {
		const invalidId = 'not-an-object-id';

		it('treats an id that is not an object id as a document that does not exist', async () => {
			expect(await repository.findById(invalidId)).toBeNull();
			await expect(repository.update(withEditor({ id: invalidId, isAlcoholic: true }))).rejects.toBeInstanceOf(
				NotFoundError,
			);
			await expect(repository.delete(invalidId)).rejects.toBeInstanceOf(NotFoundError);
		});

		it('returns null for an id that is valid but does not exist', async () => {
			expect(await repository.findById(new ObjectId().toString())).toBeNull();
		});

		it.each([
			{ title: 'without touching the names', data: { isAlcoholic: true } },
			{ title: 'while changing the names', data: { translations: { en: { name: 'Other' } } } },
		])('throws NotFoundError when updating a missing document {{title}}', async ({ data }) => {
			await expect(
				repository.update(withEditor({ id: new ObjectId().toString(), ...data })),
			).rejects.toBeInstanceOf(NotFoundError);
		});

		it('deletes the document and returns it', async () => {
			const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

			const deleted = await repository.delete(created.id);

			expect(deleted.id).toBe(created.id);
			expect(await repository.findById(created.id)).toBeNull();
			await expect(repository.delete(created.id)).rejects.toBeInstanceOf(NotFoundError);
		});
	});

	describe('search keys', () => {
		const rawSearchKeys = async (id: string) =>
			(await CategoryModel.findById(id).select('+search_keys').lean())?.search_keys;

		it('are built from the names of both languages and are not exposed on the category', async () => {
			const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

			expect(await rawSearchKeys(created.id)).toEqual(['citrus', 'citrico']);
			expect(created).not.toHaveProperty('searchKeys');
		});

		it('follow a name change and are left alone by an update that does not touch the names', async () => {
			const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

			await repository.update(withEditor({ id: created.id, translations: { en: { name: 'Tropical' } } }));
			expect(await rawSearchKeys(created.id)).toEqual(['tropical', 'citrico']);

			await repository.update(withEditor({ id: created.id, isAlcoholic: true }));
			expect(await rawSearchKeys(created.id)).toEqual(['tropical', 'citrico']);
		});

		it('make findAll ignore accents, case and the language', async () => {
			await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
			await repository.create(buildCategory({ en: 'Herb', pt: 'Erva' }));

			expect(await repository.findAll({ search: { name: 'CITRICO' } })).toHaveLength(1);
			expect(await repository.findAll({ search: { name: 'herb' } })).toHaveLength(1);
			expect(await repository.findAll({ search: { name: 'xyz' } })).toHaveLength(0);
		});
	});
});
