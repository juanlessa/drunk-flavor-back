import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { DrinksRepositoryInMemory } from './Drinks.repository';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { NotFoundError } from '@/shared/error/error.lib';

const buildCategory = (): Category => ({
	_id: new ObjectId(),
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
	is_alcoholic: false,
	created_at: new Date(),
	updated_at: new Date(),
});

const buildUnit = (): Unit => ({
	_id: new ObjectId(),
	translations: {
		en: { name: 'milliliter', name_plural: 'milliliters' },
		pt: { name: 'mililitro', name_plural: 'mililitros' },
	},
	allow_decimal: true,
	kind: 'volume',
	created_at: new Date(),
	updated_at: new Date(),
});

const buildIngredient = (): Ingredient => ({
	_id: new ObjectId(),
	translations: { en: { name: 'Lime' }, pt: { name: 'Limão' } },
	category: buildCategory(),
	unit: buildUnit(),
	created_at: new Date(),
	updated_at: new Date(),
});

let repository: DrinksRepositoryInMemory;

describe('DrinksRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new DrinksRepositoryInMemory();
	});

	it('forces cover/thumbnail to undefined and aggregate fields to zero, assigning _id and timestamps', async () => {
		const created = await repository.create({
			translations: {
				en: { name: 'Caipirinha', method: 'Muddle and stir' },
				pt: { name: 'Caipirinha', method: 'Macere e mexa' },
			},
			ingredients: [{ ingredient: buildIngredient(), quantity: 60 }],
		});

		expect(created.cover).toBeUndefined();
		expect(created.thumbnail).toBeUndefined();
		expect(created.avg_rating).toBe(0);
		expect(created.ratings_count).toBe(0);
		expect(created._id).toBeInstanceOf(ObjectId);
		expect(created.created_at).toBeInstanceOf(Date);
		expect(created.updated_at).toBeInstanceOf(Date);
	});

	it('finds a drink by name across languages', async () => {
		await repository.create({
			translations: {
				en: { name: 'Mojito', method: 'Build over ice' },
				pt: { name: 'Mojito BR', method: 'Monte com gelo' },
			},
			ingredients: [],
		});

		expect(await repository.findByName({ en: { name: 'Mojito' } })).not.toBeNull();
		expect(await repository.findByName({ pt: { name: 'Mojito BR' } })).not.toBeNull();
		expect(await repository.findByName({ en: { name: 'Nonexistent' } })).toBeNull();
	});

	it('throws NotFoundError when updating a missing id', async () => {
		await expect(
			repository.update({ id: new ObjectId().toString(), translations: { en: { name: 'X' } } }),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('deep-merges on update and refreshes updated_at', async () => {
		const created = await repository.create({
			translations: {
				en: { name: 'Negroni', method: 'Stir' },
				pt: { name: 'Negroni', method: 'Mexa' },
			},
			ingredients: [],
		});
		const originalUpdatedAt = created.updated_at.getTime();

		const updated = await repository.update({
			id: created._id.toString(),
			translations: { en: { name: 'Negroni Sbagliato' } },
		});

		expect(updated.translations.en.name).toBe('Negroni Sbagliato');
		// Untouched fields are preserved by the deep merge.
		expect(updated.translations.en.method).toBe('Stir');
		expect(updated.translations.pt.name).toBe('Negroni');
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});

	it('throws NotFoundError when deleting a missing id', async () => {
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
	});

	it('applies search, sort and pagination in findAll', async () => {
		await repository.create({
			translations: { en: { name: 'Alpha', method: 'm' }, pt: { name: 'Alpha', method: 'm' } },
			ingredients: [],
		});
		await repository.create({
			translations: { en: { name: 'Beta', method: 'm' }, pt: { name: 'Beta', method: 'm' } },
			ingredients: [],
		});
		await repository.create({
			translations: { en: { name: 'Gamma', method: 'm' }, pt: { name: 'Gamma', method: 'm' } },
			ingredients: [],
		});

		const sortedPage = await repository.findAll({
			sort: { 'translations.en.name': 1 },
			limit: 2,
			page: 1,
		});

		expect(sortedPage.map((drink) => drink.translations.en.name)).toEqual(['Alpha', 'Beta']);
	});
});
