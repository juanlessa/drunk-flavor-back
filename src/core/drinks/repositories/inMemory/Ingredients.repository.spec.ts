import { beforeEach, describe, expect, it } from 'vitest';
import { withCreator, withEditor } from '@/core/drinks/factories/authorship.factories';
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
	repository.create(
		withCreator({
			translations: { en: { name: name.en }, pt: { name: name.pt } },
			category: buildCategory(),
			units: [buildUnit()],
		}),
	);

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
			repository.update(withEditor({ id: new ObjectId().toString(), translations: { en: { name: 'X' } } })),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('deep-merges on update and refreshes updatedAt', async () => {
		const created = await createIngredient(repository, { en: 'Lime', pt: 'Limão' });
		const originalUpdatedAt = created.updatedAt.getTime();

		const updated = await repository.update(
			withEditor({
				id: created.id,
				translations: { en: { name: 'Lemon' } },
			}),
		);

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
		const branded = await repository.create(
			withCreator({
				translations: { en: { name: 'Licor 43' }, pt: { name: 'Licor 43' } },
				category: buildCategory(),
				units: [buildUnit()],
				kind: 'branded',
				brand: 'Licor 43',
			}),
		);

		expect(generic.kind).toBe('generic');
		expect(generic.brand).toBeUndefined();
		expect(branded).toMatchObject({ kind: 'branded', brand: 'Licor 43' });
	});

	describe('update', () => {
		const createDescribed = () =>
			repository.create(
				withCreator({
					translations: {
						en: { name: 'Triple sec', description: 'Orange liqueur' },
						pt: { name: 'Triple sec', description: 'Licor de laranja' },
					},
					category: buildCategory(),
					units: [buildUnit()],
					kind: 'branded',
					brand: 'Bols',
				}),
			);

		it('replaces, keeps and removes the description of each language', async () => {
			const created = await createDescribed();

			const updated = await repository.update(
				withEditor({
					id: created.id,
					translations: {
						en: { name: 'Triple sec', description: 'Orange-flavored liqueur' },
						pt: { name: 'Triple sec', description: null },
					},
				}),
			);

			expect(updated.translations.en.description).toBe('Orange-flavored liqueur');
			expect(updated.translations.pt).toEqual({ name: 'Triple sec' });
		});

		it('replaces, keeps and removes the plural name of each language', async () => {
			const created = await repository.create(
				withCreator({
					translations: {
						en: { name: 'Lime', namePlural: 'Limes' },
						pt: { name: 'Limão', namePlural: 'Limões' },
					},
					category: buildCategory(),
					units: [buildUnit()],
				}),
			);
			const replaced = await repository.update(
				withEditor({
					id: created.id,
					translations: { en: { name: 'Lime', namePlural: 'Lime fruits' } },
				}),
			);
			expect(replaced.translations.en.namePlural).toBe('Lime fruits');
			expect(replaced.translations.pt.namePlural).toBe('Limões');
			const removed = await repository.update(
				withEditor({
					id: created.id,
					translations: { pt: { name: 'Limão', namePlural: null } },
				}),
			);
			expect(removed.translations.pt).toEqual({ name: 'Limão' });
			expect(removed.translations.en.namePlural).toBe('Lime fruits');
		});

		it('keeps the description of a language that is not in the patch', async () => {
			const created = await createDescribed();

			const updated = await repository.update(
				withEditor({ id: created.id, translations: { en: { name: 'Triple sec 2' } } }),
			);

			expect(updated.translations.en).toEqual({ name: 'Triple sec 2', description: 'Orange liqueur' });
			expect(updated.translations.pt.description).toBe('Licor de laranja');
		});

		it('changes, keeps and removes the brand', async () => {
			const created = await createDescribed();

			expect((await repository.update(withEditor({ id: created.id, brand: 'Other' }))).brand).toBe('Other');
			expect((await repository.update(withEditor({ id: created.id, kind: 'branded' }))).brand).toBe('Other');

			const generic = await repository.update(withEditor({ id: created.id, kind: 'generic', brand: null }));
			expect(generic.kind).toBe('generic');
			expect(generic).not.toHaveProperty('brand');
		});

		it('replaces the list of units', async () => {
			const created = await createDescribed();
			const [first, second] = [buildUnit(), buildUnit()];

			const updated = await repository.update(withEditor({ id: created.id, units: [first, second] }));
			const cleared = await repository.update(withEditor({ id: created.id, units: [] }));

			expect(updated.units.map(({ id }) => id)).toEqual([first.id, second.id]);
			expect(cleared.units).toEqual([]);
		});
	});

	describe('findAll by name', () => {
		beforeEach(async () => {
			await repository.create(
				withCreator({
					translations: {
						en: { name: 'Coconut water' },
						pt: { name: 'Água de coco' },
					},
					category: buildCategory(),
					units: [buildUnit()],
				}),
			);
			await repository.create(
				withCreator({
					translations: {
						en: { name: 'Triple sec', description: 'Liqueur of orange' },
						pt: { name: 'Triple sec', description: 'Licor de laranja' },
					},
					category: buildCategory(),
					units: [buildUnit()],
				}),
			);
			await repository.create(
				withCreator({
					translations: { en: { name: 'Gabriela' }, pt: { name: 'Gabriela' } },
					category: buildCategory(),
					units: [buildUnit()],
					kind: 'branded',
					brand: 'Cravo',
				}),
			);
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

	describe('findAll ranked by name', () => {
		const named = (en: string, extra: Partial<Parameters<IngredientsRepositoryInMemory['create']>[0]> = {}) =>
			repository.create(
				withCreator({
					translations: { en: { name: en }, pt: { name: en } },
					category: buildCategory(),
					units: [buildUnit()],
					...extra,
				}),
			);

		it('lists the name matches, then the description and brand ones, then the category ones, and the sort breaks ties', async () => {
			await named('Bitter', {
				category: {
					...buildCategory(),
					translations: { en: { name: 'Orange family' }, pt: { name: 'Laranja' } },
				},
			});
			await named('Cointreau', { kind: 'branded', brand: 'Orange Co' });
			await named('Curaçao', {
				translations: { en: { name: 'Curaçao', description: 'Orange peel' }, pt: { name: 'Curaçao' } },
			});
			await named('Orange');

			const found = async (sort?: Record<string, 1 | -1>) =>
				(await repository.findAll({ search: { name: 'orange' }, sort })).map(
					({ translations }) => translations.en.name,
				);

			expect(await found()).toEqual(['Orange', 'Cointreau', 'Curaçao', 'Bitter']);
			expect(await found({ 'translations.en.name': 1 })).toEqual(['Orange', 'Cointreau', 'Curaçao', 'Bitter']);
			expect(await found({ 'translations.en.name': -1 })).toEqual(['Orange', 'Curaçao', 'Cointreau', 'Bitter']);
		});

		it('keeps the owned ingredients first and ranks inside each group', async () => {
			await named('Orange', { createdBy: 'someone-else' });
			const mine = await named('Orange peel syrup', { createdBy: 'me' });
			await named('Cointreau', { kind: 'branded', brand: 'Orange Co', createdBy: 'me' });

			const found = await repository.findAllOwnedFirst({ search: { name: 'orange' } }, 'me');

			expect(found.map(({ translations }) => translations.en.name)).toEqual([
				mine.translations.en.name,
				'Cointreau',
				'Orange',
			]);
		});
	});
});
