import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IngredientsRepositoryInMemory } from './Ingredients.repository';
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

const createIngredient = (
	repository: IngredientsRepositoryInMemory,
	name: { en: string; pt: string },
): Promise<Ingredient> =>
	repository.create({
		translations: { en: { name: name.en }, pt: { name: name.pt } },
		category: buildCategory(),
		unit: buildUnit(),
	});

let repository: IngredientsRepositoryInMemory;

describe('IngredientsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new IngredientsRepositoryInMemory();
	});

	it('findByIdList returns only matching ids, ignoring unknown ids', async () => {
		const first = await createIngredient(repository, { en: 'Lime', pt: 'Limão' });
		const second = await createIngredient(repository, { en: 'Mint', pt: 'Hortelã' });

		const result = await repository.findByIdList([
			first._id.toString(),
			second._id.toString(),
			new ObjectId().toString(),
		]);

		expect(result.map((ingredient) => ingredient._id.toString()).sort()).toEqual(
			[first._id.toString(), second._id.toString()].sort(),
		);
	});

	it('findByIdList returns an empty array for an empty or no-match id list', async () => {
		await createIngredient(repository, { en: 'Lime', pt: 'Limão' });

		expect(await repository.findByIdList([])).toEqual([]);
		expect(await repository.findByIdList([new ObjectId().toString()])).toEqual([]);
	});

	it('throws NotFoundError when updating a missing id', async () => {
		await expect(
			repository.update({ id: new ObjectId().toString(), translations: { en: { name: 'X' } } }),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('deep-merges on update and refreshes updated_at', async () => {
		const created = await createIngredient(repository, { en: 'Lime', pt: 'Limão' });
		const originalUpdatedAt = created.updated_at.getTime();

		const updated = await repository.update({
			id: created._id.toString(),
			translations: { en: { name: 'Lemon' } },
		});

		expect(updated.translations.en.name).toBe('Lemon');
		// pt name and the embedded category survive the deep merge.
		expect(updated.translations.pt.name).toBe('Limão');
		expect(updated.category.translations.en.name).toBe('Syrup');
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});

	it('throws NotFoundError when deleting a missing id', async () => {
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
	});

	it('finds an ingredient by name across languages', async () => {
		await createIngredient(repository, { en: 'Lime', pt: 'Limão' });

		expect(await repository.findByName({ en: { name: 'Lime' } })).not.toBeNull();
		expect(await repository.findByName({ pt: { name: 'Limão' } })).not.toBeNull();
		expect(await repository.findByName({ en: { name: 'Nonexistent' } })).toBeNull();
	});
});
