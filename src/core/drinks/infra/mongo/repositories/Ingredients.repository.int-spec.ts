import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IngredientsRepository } from './Ingredients.repository';
import { IngredientModel } from '../entities/ingredient.model';
import { CreateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

const buildCategory = (): Category => ({
	id: new ObjectId().toString(),
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
	isAlcoholic: false,
	createdAt: new Date(),
	updatedAt: new Date(),
});

const buildUnit = (): Unit => ({
	id: new ObjectId().toString(),
	translations: {
		en: { name: 'milliliter', namePlural: 'milliliters' },
		pt: { name: 'mililitro', namePlural: 'mililitros' },
	},
	allowDecimal: true,
	kind: 'volume',
	createdAt: new Date(),
	updatedAt: new Date(),
});

const buildIngredient = (name: { en: string; pt: string }): CreateIngredient => ({
	translations: { en: { name: name.en }, pt: { name: name.pt } },
	category: buildCategory(),
	unit: buildUnit(),
});

let repository: IngredientsRepository;

describe('IngredientsRepository (integration)', () => {
	beforeAll(async () => {
		await IngredientModel.init();
	});

	beforeEach(() => {
		repository = new IngredientsRepository();
	});

	afterEach(async () => {
		await IngredientModel.deleteMany({});
	});

	it('returns lean documents without __v and reads embedded category/unit', async () => {
		const created = await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

		const byId = await repository.findById(created.id);
		expect(byId as Record<string, unknown>).not.toHaveProperty('__v');
		expect(byId?.category.translations.en.name).toBe('Syrup');
		expect(byId?.unit.translations.en.name).toBe('milliliter');
	});

	it('finds by name across languages and returns null on no match', async () => {
		await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

		expect(await repository.findByName({ en: { name: 'Lime' } })).not.toBeNull();
		expect(await repository.findByName({ pt: { name: 'Limão' } })).not.toBeNull();
		expect(await repository.findByName({ en: { name: 'Nonexistent' } })).toBeNull();
	});

	it('findByIdList returns matching ids, [] for empty, and ignores unknown ids', async () => {
		const first = await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));
		const second = await repository.create(buildIngredient({ en: 'Mint', pt: 'Hortelã' }));

		const matched = await repository.findByIdList([first.id, second.id, new ObjectId().toString()]);
		expect(matched.map((item) => item.id).sort()).toEqual([first.id, second.id].sort());
		expect(await repository.findByIdList([])).toEqual([]);
		expect(await repository.findByIdList([new ObjectId().toString()])).toEqual([]);
	});

	it('throws NotFoundError on update/delete of a missing id and returns the updated doc on success', async () => {
		await expect(
			repository.update({ id: new ObjectId().toString(), translations: { en: { name: 'X' } } }),
		).rejects.toBeInstanceOf(NotFoundError);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));
		const updated = await repository.update({
			id: created.id,
			translations: { en: { name: 'Lemon' }, pt: { name: 'Limão' } },
		});
		expect(updated.translations.en.name).toBe('Lemon');
	});

	it('translates a sequential duplicate en/pt name create to BadRequestError', async () => {
		await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

		await expect(repository.create(buildIngredient({ en: 'Lime', pt: 'Outro' }))).rejects.toBeInstanceOf(
			BadRequestError,
		);
		await expect(repository.create(buildIngredient({ en: 'Other', pt: 'Limão' }))).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});

	it('resolves a concurrent create race to one persisted doc and one domain rejection', async () => {
		const results = await Promise.allSettled([
			repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' })),
			repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' })),
		]);

		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
		expect(rejected).toHaveLength(1);
		expect(rejected[0].reason).toBeInstanceOf(BadRequestError);

		expect(await IngredientModel.countDocuments({ 'translations.en.name': 'Lime' })).toBe(1);
	});

	it('translates an update rename collision to BadRequestError', async () => {
		await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));
		const other = await repository.create(buildIngredient({ en: 'Mint', pt: 'Hortelã' }));

		await expect(
			repository.update({ id: other.id, translations: { en: { name: 'Lime' } } }),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('orders findAll deterministically with the _id tie-breaker under equal sort keys', async () => {
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await IngredientModel.collection.insertMany(
			ids.map((id, index) => ({
				_id: id,
				translations: { en: { name: `Ing ${index}` }, pt: { name: `Ing PT ${index}` } },
				category: buildCategory(),
				unit: buildUnit(),
				createdAt: sharedDate,
				updatedAt: sharedDate,
			})),
		);

		const expectedOrder = [...ids].map((id) => id.toString()).sort((a, b) => (a > b ? -1 : 1));

		const firstPage = await repository.findAll({ page: 1, limit: 2, sort: { createdAt: -1 } });
		const secondPage = await repository.findAll({ page: 2, limit: 2, sort: { createdAt: -1 } });

		expect(firstPage.map((item) => item.id)).toEqual(expectedOrder.slice(0, 2));
		expect(secondPage.map((item) => item.id)).toEqual(expectedOrder.slice(2, 3));
	});

	it('succeeds with no sort supplied', async () => {
		await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));
		await expect(repository.findAll({})).resolves.toHaveLength(1);
	});
});
