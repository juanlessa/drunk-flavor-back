import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { IngredientsRepositoryInMemory } from './Ingredients.repository';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { NotFoundError } from '@/shared/error/error.lib';

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

const createIngredient = (
	repository: IngredientsRepositoryInMemory,
	name: { en: string; pt: string },
): Promise<Ingredient> =>
	repository.create({
		translations: { en: { name: name.en }, pt: { name: name.pt } },
		category: buildCategory(),
		units: [buildUnit()],
	});

let repository: IngredientsRepositoryInMemory;

describe('IngredientsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new IngredientsRepositoryInMemory();
	});

	it('findByIdList returns only matching ids, ignoring unknown ids', async () => {
		const first = await createIngredient(repository, { en: 'Lime', pt: 'Limão' });
		const second = await createIngredient(repository, { en: 'Mint', pt: 'Hortelã' });

		const result = await repository.findByIdList([first.id, second.id, new ObjectId().toString()]);

		expect(result.map((ingredient) => ingredient.id).sort()).toEqual([first.id, second.id].sort());
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

	it('deep-merges on update and refreshes updatedAt', async () => {
		const created = await createIngredient(repository, { en: 'Lime', pt: 'Limão' });
		const originalUpdatedAt = created.updatedAt.getTime();

		const updated = await repository.update({
			id: created.id,
			translations: { en: { name: 'Lemon' } },
		});

		expect(updated.translations.en.name).toBe('Lemon');
		// pt name and the embedded category survive the deep merge.
		expect(updated.translations.pt.name).toBe('Limão');
		expect(updated.category.translations.en.name).toBe('Syrup');
		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
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

	it('creates a generic ingredient by default and keeps a given kind and brand', async () => {
		const generic = await createIngredient(repository, { en: 'Lime', pt: 'Limão' });
		const branded = await repository.create({
			translations: { en: { name: 'Licor 43' }, pt: { name: 'Licor 43' } },
			category: buildCategory(),
			units: [buildUnit()],
			kind: 'branded',
			brand: 'Licor 43',
		});

		expect(generic.kind).toBe('generic');
		expect(generic.brand).toBeUndefined();
		expect(branded).toMatchObject({ kind: 'branded', brand: 'Licor 43' });
	});

	describe('update', () => {
		const createDescribed = () =>
			repository.create({
				translations: {
					en: { name: 'Triple sec', description: 'Orange liqueur' },
					pt: { name: 'Triple sec', description: 'Licor de laranja' },
				},
				category: buildCategory(),
				units: [buildUnit()],
				kind: 'branded',
				brand: 'Bols',
			});

		it('replaces, keeps and removes the description of each language', async () => {
			const created = await createDescribed();

			const updated = await repository.update({
				id: created.id,
				translations: {
					en: { name: 'Triple sec', description: 'Orange-flavored liqueur' },
					pt: { name: 'Triple sec', description: null },
				},
			});

			expect(updated.translations.en.description).toBe('Orange-flavored liqueur');
			expect(updated.translations.pt).toEqual({ name: 'Triple sec' });
		});

		it('keeps the description of a language that is not in the patch', async () => {
			const created = await createDescribed();

			const updated = await repository.update({ id: created.id, translations: { en: { name: 'Triple sec 2' } } });

			expect(updated.translations.en).toEqual({ name: 'Triple sec 2', description: 'Orange liqueur' });
			expect(updated.translations.pt.description).toBe('Licor de laranja');
		});

		it('changes, keeps and removes the brand', async () => {
			const created = await createDescribed();

			expect((await repository.update({ id: created.id, brand: 'Other' })).brand).toBe('Other');
			expect((await repository.update({ id: created.id, kind: 'branded' })).brand).toBe('Other');

			const generic = await repository.update({ id: created.id, kind: 'generic', brand: null });
			expect(generic.kind).toBe('generic');
			expect(generic).not.toHaveProperty('brand');
		});

		it('replaces the list of units', async () => {
			const created = await createDescribed();
			const [first, second] = [buildUnit(), buildUnit()];

			const updated = await repository.update({ id: created.id, units: [first, second] });
			const cleared = await repository.update({ id: created.id, units: [] });

			expect(updated.units.map(({ id }) => id)).toEqual([first.id, second.id]);
			expect(cleared.units).toEqual([]);
		});
	});

	describe('findAll by name', () => {
		beforeEach(async () => {
			await repository.create({
				translations: {
					en: { name: 'Coconut water' },
					pt: { name: 'Água de coco' },
				},
				category: buildCategory(),
				units: [buildUnit()],
			});
			await repository.create({
				translations: {
					en: { name: 'Triple sec', description: 'Liqueur of orange' },
					pt: { name: 'Triple sec', description: 'Licor de laranja' },
				},
				category: buildCategory(),
				units: [buildUnit()],
			});
			await repository.create({
				translations: { en: { name: 'Gabriela' }, pt: { name: 'Gabriela' } },
				category: buildCategory(),
				units: [buildUnit()],
				kind: 'branded',
				brand: 'Cravo',
			});
		});

		const find = async (name: string) =>
			(await repository.findAll({ search: { name } })).map(({ translations }) => translations.en.name);

		it('ignores accents, case and the language', async () => {
			expect(await find('AGUA')).toEqual(['Coconut water']);
			expect(await find('coconut')).toEqual(['Coconut water']);
			expect(await find('agua de coco')).toEqual(['Coconut water']);
		});

		it('finds an ingredient by its description and brand', async () => {
			expect(await find('laranja')).toEqual(['Triple sec']);
			expect(await find('orange')).toEqual(['Triple sec']);
			expect(await find('cravo')).toEqual(['Gabriela']);
		});

		it('does not match everything with a stop word that only appears in a description', async () => {
			expect(await find('e')).toEqual([]);
			expect(await find('of')).toEqual([]);
			expect(await find('de')).toEqual(['Coconut water']); // still part of a name
		});

		it('matches nothing when a word of the term is unknown', async () => {
			expect(await find('laranja xyz')).toEqual([]);
		});
	});
});
