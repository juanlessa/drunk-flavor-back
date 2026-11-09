import { ObjectId } from 'mongodb';
import { FACTORY_CREATOR_ID } from '@/core/drinks/factories/authorship.factories';
import { withEditor } from '@/core/drinks/factories/authorship.factories';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateCategory } from '@/core/drinks/dtos/category.dtos';
import { NotFoundError } from '@/shared/error/error.lib';
import { CategoriesRepositoryInMemory } from './Categories.repository';

const buildCategory = (name: { en: string; pt: string }, isAlcoholic = false): CreateCategory => ({
	createdBy: FACTORY_CREATOR_ID,
	translations: { en: { name: name.en }, pt: { name: name.pt } },
	isAlcoholic,
});

let repository: CategoriesRepositoryInMemory;

describe('CategoriesRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new CategoriesRepositoryInMemory();
	});

	it('assigns an id and the timestamps when creating, keeping the given data', async () => {
		const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }, true));

		expect(created.id).toEqual(expect.any(String));
		expect(created.createdAt).toBeInstanceOf(Date);
		expect(created.updatedAt).toBeInstanceOf(Date);
		expect(created).toMatchObject({ translations: { en: { name: 'Citrus' } }, isAlcoholic: true });
	});

	it('finds a category by id and returns null for an unknown id', async () => {
		const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

		expect(await repository.findById(created.id)).toBe(created);
		expect(await repository.findById(new ObjectId().toString())).toBeNull();
	});

	describe('findByName', () => {
		beforeEach(async () => {
			await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
		});

		it('finds a category by the name of either language', async () => {
			expect(await repository.findByName({ en: { name: 'Citrus' } })).not.toBeNull();
			expect(await repository.findByName({ pt: { name: 'Cítrico' } })).not.toBeNull();
		});

		it('ignores case and accents, like the unique name indexes do', async () => {
			expect(await repository.findByName({ en: { name: 'CITRUS' } })).not.toBeNull();
			expect(await repository.findByName({ pt: { name: 'citrico' } })).not.toBeNull();
		});

		it('returns null when no name matches', async () => {
			expect(await repository.findByName({ en: { name: 'Herb' } })).toBeNull();
			expect(await repository.findByName({})).toBeNull();
		});
	});

	describe('update', () => {
		it('throws NotFoundError for a missing id', async () => {
			await expect(
				repository.update(withEditor({ id: new ObjectId().toString(), isAlcoholic: true })),
			).rejects.toBeInstanceOf(NotFoundError);
		});

		it('deep-merges the data, keeps the other fields and refreshes updatedAt', async () => {
			const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
			const originalUpdatedAt = created.updatedAt.getTime();

			const updated = await repository.update(
				withEditor({ id: created.id, translations: { en: { name: 'Tropical' } } }),
			);

			expect(updated.translations.en.name).toBe('Tropical');
			expect(updated.translations.pt.name).toBe('Cítrico');
			expect(updated.isAlcoholic).toBe(false);
			expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
			expect(await repository.findById(created.id)).toEqual(updated);
		});

		it('keeps false when the flag is updated to false', async () => {
			const created = await repository.create(buildCategory({ en: 'Spirit', pt: 'Destilado' }, true));

			const updated = await repository.update(withEditor({ id: created.id, isAlcoholic: false }));

			expect(updated.isAlcoholic).toBe(false);
		});
	});

	describe('delete', () => {
		it('throws NotFoundError for a missing id', async () => {
			await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
		});

		it('removes the category and returns it', async () => {
			const created = await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
			await repository.create(buildCategory({ en: 'Herb', pt: 'Erva' }));

			const deleted = await repository.delete(created.id);

			expect(deleted.id).toBe(created.id);
			expect(await repository.findById(created.id)).toBeNull();
			expect(await repository.findAll({})).toHaveLength(1);
		});
	});

	describe('findAll', () => {
		const namesOf = async (query: Parameters<CategoriesRepositoryInMemory['findAll']>[0]) =>
			(await repository.findAll(query)).map(({ translations }) => translations.en.name);

		beforeEach(async () => {
			await repository.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
			await repository.create(buildCategory({ en: 'Herb', pt: 'Erva' }));
			await repository.create(buildCategory({ en: 'Spirit', pt: 'Destilado' }, true));
		});

		it('returns every category when nothing is asked', async () => {
			expect(await namesOf({})).toEqual(['Citrus', 'Herb', 'Spirit']);
		});

		it('searches by name ignoring case, accents and the language', async () => {
			expect(await namesOf({ search: { name: 'CITRICO' } })).toEqual(['Citrus']);
			expect(await namesOf({ search: { name: 'herb' } })).toEqual(['Herb']);
			expect(await namesOf({ search: { name: 'destil' } })).toEqual(['Spirit']);
			expect(await namesOf({ search: { name: 'xyz' } })).toEqual([]);
		});

		it('matches the start of each word of the term', async () => {
			expect(await namesOf({ search: { name: 'ci' } })).toEqual(['Citrus']);
			expect(await namesOf({ search: { name: 'itrus' } })).toEqual([]);
		});

		it('sorts, then paginates', async () => {
			expect(await namesOf({ sort: { 'translations.en.name': 'desc' } })).toEqual(['Spirit', 'Herb', 'Citrus']);
			expect(await namesOf({ sort: { 'translations.en.name': 'asc' }, limit: 2, page: 1 })).toEqual([
				'Citrus',
				'Herb',
			]);
			expect(await namesOf({ sort: { 'translations.en.name': 'asc' }, limit: 2, page: 2 })).toEqual(['Spirit']);
		});
	});
});
