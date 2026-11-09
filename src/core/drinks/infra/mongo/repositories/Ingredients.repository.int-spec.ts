import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FACTORY_CREATOR_ID } from '@/core/drinks/factories/authorship.factories';
import { withCreator, withEditor } from '@/core/drinks/factories/authorship.factories';
import { ObjectId } from 'mongodb';
import { IngredientsRepository } from './Ingredients.repository';
import { IngredientModel } from '../entities/ingredient.model';
import { CreateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';

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
	createdBy: FACTORY_CREATOR_ID,
	translations: { en: { name: name.en }, pt: { name: name.pt } },
	category: buildCategory(),
	units: [buildUnit()],
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

	it('returns lean documents without __v and reads embedded category/units', async () => {
		const created = await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

		const byId = await repository.findById(created.id);
		expect(byId as Record<string, unknown>).not.toHaveProperty('__v');
		expect(byId?.category.translations.en.name).toBe('Syrup');
		expect(byId?.units[0].translations.en.name).toBe('milliliter');
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
			repository.update(withEditor({ id: new ObjectId().toString(), translations: { en: { name: 'X' } } })),
		).rejects.toBeInstanceOf(NotFoundError);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));
		const updated = await repository.update(
			withEditor({
				id: created.id,
				translations: { en: { name: 'Lemon' }, pt: { name: 'Limão' } },
			}),
		);
		expect(updated.translations.en.name).toBe('Lemon');
	});

	it('translates a sequential duplicate en/pt name create to ConflictError', async () => {
		await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

		await expect(repository.create(buildIngredient({ en: 'Lime', pt: 'Outro' }))).rejects.toBeInstanceOf(
			ConflictError,
		);
		await expect(repository.create(buildIngredient({ en: 'Other', pt: 'Limão' }))).rejects.toBeInstanceOf(
			ConflictError,
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
		expect(rejected[0].reason).toBeInstanceOf(ConflictError);

		expect(await IngredientModel.countDocuments({ 'translations.en.name': 'Lime' })).toBe(1);
	});

	it('translates an update rename collision to ConflictError', async () => {
		await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));
		const other = await repository.create(buildIngredient({ en: 'Mint', pt: 'Hortelã' }));

		await expect(
			repository.update(withEditor({ id: other.id, translations: { en: { name: 'Lime' } } })),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('orders findAll deterministically with the _id tie-breaker under equal sort keys', async () => {
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await IngredientModel.collection.insertMany(
			ids.map((id, index) => ({
				_id: id,
				translations: { en: { name: `Ing ${index}` }, pt: { name: `Ing PT ${index}` } },
				category: buildCategory(),
				units: [buildUnit()],
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

	describe('kind, brand, description and units', () => {
		const rawSearchKeys = async (id: string) =>
			(await IngredientModel.findById(id).select('+search_keys').lean())?.search_keys;

		const createDescribed = () =>
			repository.create(
				withCreator({
					translations: {
						en: { name: 'Gabriela', description: 'Clove and cinnamon cachaça' },
						pt: { name: 'Gabriela', description: 'Cachaça de cravo e canela' },
					},
					category: buildCategory(),
					units: [buildUnit()],
					kind: 'branded',
					brand: 'Gabriela',
				}),
			);

		it('persists the kind, the brand and the description of each language', async () => {
			const created = await createDescribed();
			const byId = await repository.findById(created.id);

			expect(byId).toMatchObject({ kind: 'branded', brand: 'Gabriela' });
			expect(byId?.translations.pt.description).toBe('Cachaça de cravo e canela');
		});

		it('creates a generic ingredient by default', async () => {
			const created = await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

			expect(created.kind).toBe('generic');
			expect(created).not.toHaveProperty('brand');
		});

		it('keeps the units in the given order and the units ids of the embedded snapshots', async () => {
			const [first, second] = [buildUnit(), buildUnit()];
			const created = await repository.create({
				...buildIngredient({ en: 'Lime', pt: 'Limão' }),
				units: [second, first],
			});

			const byId = await repository.findById(created.id);

			expect(byId?.units.map(({ id }) => id)).toEqual([second.id, first.id]);
		});

		it('persists an ingredient without units, which means it is not measurable', async () => {
			const created = await repository.create({ ...buildIngredient({ en: 'Foam', pt: 'Espuma' }), units: [] });

			expect((await repository.findById(created.id))?.units).toEqual([]);
		});

		describe('plural name', () => {
			const eachUnit = (): Unit => ({
				...buildUnit(),
				translations: {
					en: { name: 'unit', namePlural: 'units' },
					pt: { name: 'unidade', namePlural: 'unidades' },
				},
				kind: 'count',
				allowDecimal: false,
				useIngredientName: true,
			});
			const createLime = (units: Unit[] = [eachUnit()]) =>
				repository.create(
					withCreator({
						translations: {
							en: { name: 'Lime', namePlural: 'Limes' },
							pt: { name: 'Limão', namePlural: 'Limões' },
						},
						category: buildCategory(),
						units,
					}),
				);

			it('persists the plural name of each language and the flag of the embedded unit', async () => {
				const created = await createLime();
				const byId = await repository.findById(created.id);

				expect(byId?.translations.en.namePlural).toBe('Limes');
				expect(byId?.translations.pt.namePlural).toBe('Limões');
				expect(byId?.units[0]?.useIngredientName).toBe(true);
				const raw = await IngredientModel.collection.findOne({ _id: new ObjectId(created.id) });
				expect((raw?.translations as { en: Record<string, unknown> }).en['name_plural']).toBe('Limes');
			});

			it('leaves the plural name out of an ingredient that does not have one', async () => {
				const created = await repository.create(buildIngredient({ en: 'Gin', pt: 'Gin' }));
				expect((await repository.findById(created.id))?.translations.en).not.toHaveProperty('namePlural');
			});

			it('replaces it in one language and keeps it in the other', async () => {
				const created = await createLime();
				const updated = await repository.update(
					withEditor({
						id: created.id,
						translations: { en: { name: 'Lime', namePlural: 'Lime fruits' } },
					}),
				);

				expect(updated.translations.en.namePlural).toBe('Lime fruits');
				expect(updated.translations.pt.namePlural).toBe('Limões');
			});

			it('removes it with null, in the document too', async () => {
				const created = await createLime();
				const updated = await repository.update(
					withEditor({
						id: created.id,
						translations: { pt: { name: 'Limão', namePlural: null } },
					}),
				);

				expect(updated.translations.pt).toEqual({ name: 'Limão' });
				expect(updated.translations.en.namePlural).toBe('Limes');
				const raw = await IngredientModel.collection.findOne({ _id: new ObjectId(created.id) });
				expect((raw?.translations as { pt: object }).pt).not.toHaveProperty('name_plural');
			});
		});

		it('keeps the description of the languages that are not in the update', async () => {
			const created = await createDescribed();

			const updated = await repository.update(
				withEditor({
					id: created.id,
					translations: { en: { name: 'Gabriela', description: 'Changed' } },
				}),
			);

			expect(updated.translations.en.description).toBe('Changed');
			expect(updated.translations.pt.description).toBe('Cachaça de cravo e canela');
		});

		it('removes the description and the brand with null', async () => {
			const created = await createDescribed();

			const updated = await repository.update(
				withEditor({
					id: created.id,
					kind: 'generic',
					brand: null,
					translations: { pt: { name: 'Gabriela', description: null } },
				}),
			);

			expect(updated.kind).toBe('generic');
			expect(updated).not.toHaveProperty('brand');
			expect(updated.translations.pt).toEqual({ name: 'Gabriela' });
			expect(updated.translations.en.description).toBe('Clove and cinnamon cachaça');

			const raw = await IngredientModel.collection.findOne({ _id: new ObjectId(created.id) });
			expect(raw).not.toHaveProperty('brand');
			expect((raw?.translations as { pt: object }).pt).not.toHaveProperty('description');
		});

		it('keeps the brand when the update does not mention it', async () => {
			const created = await createDescribed();

			const updated = await repository.update(withEditor({ id: created.id, kind: 'branded' }));

			expect(updated.brand).toBe('Gabriela');
		});

		it('replaces the list of units on update', async () => {
			const created = await createDescribed();
			const next = buildUnit();

			const updated = await repository.update(withEditor({ id: created.id, units: [next] }));
			const cleared = await repository.update(withEditor({ id: created.id, units: [] }));

			expect(updated.units.map(({ id }) => id)).toEqual([next.id]);
			expect(cleared.units).toEqual([]);
		});

		describe('search keys', () => {
			it('are built from the names, the descriptions without stop words and the brand', async () => {
				const created = await createDescribed();

				const keys = (await rawSearchKeys(created.id)) ?? [];

				expect(keys).toEqual(
					expect.arrayContaining(['gabriela', 'clove', 'cinnamon', 'cachaca', 'cravo', 'canela']),
				);
				expect(keys).not.toContain('and');
				expect(keys).not.toContain('de');
			});

			it('are not exposed on the returned ingredient', async () => {
				const created = await createDescribed();

				expect(created).not.toHaveProperty('searchKeys');
				expect(created).not.toHaveProperty('search_keys');
				expect(await repository.findById(created.id)).not.toHaveProperty('searchKeys');
			});

			it('are recalculated when a name, a description or the brand changes', async () => {
				const created = await createDescribed();

				await repository.update(
					withEditor({
						id: created.id,
						brand: 'Cravo Brand',
						translations: { en: { name: 'Cloved', description: 'Spiced' } },
					}),
				);

				const keys = (await rawSearchKeys(created.id)) ?? [];
				expect(keys).toEqual(expect.arrayContaining(['cloved', 'spiced', 'cravo', 'brand'])); // en + brand
				expect(keys).toContain('canela'); // the pt description was not touched
				expect(keys).not.toContain('clove');
				expect(keys).not.toContain('cinnamon');
			});

			it('forget a removed description and a removed brand', async () => {
				const created = await repository.create({
					...buildIngredient({ en: 'Rum', pt: 'Rum' }),
					translations: {
						en: { name: 'Rum', description: 'Spirit' },
						pt: { name: 'Rum', description: 'Destilado' },
					},
					kind: 'branded',
					brand: 'Havana',
				});
				expect(await rawSearchKeys(created.id)).toEqual(
					expect.arrayContaining(['spirit', 'destilado', 'havana']),
				);

				await repository.update(
					withEditor({
						id: created.id,
						kind: 'generic',
						brand: null,
						translations: {
							en: { name: 'Rum', description: null },
							pt: { name: 'Rum', description: null },
						},
					}),
				);

				expect(await rawSearchKeys(created.id)).toEqual(['rum']);
			});

			it('are recalculated by a brand-only update', async () => {
				const created = await createDescribed();

				await repository.update(withEditor({ id: created.id, brand: 'Outra Marca' }));

				const keys = (await rawSearchKeys(created.id)) ?? [];
				expect(keys).toEqual(expect.arrayContaining(['outra', 'marca', 'canela']));
			});
		});
	});

	describe('findAll', () => {
		const names = async (query: Parameters<IngredientsRepository['findAll']>[0]) =>
			(await repository.findAll(query)).map(({ translations }) => translations.pt.name);

		beforeEach(async () => {
			await repository.create(buildIngredient({ en: 'Zebra syrup', pt: 'Zebra' }));
			await repository.create(buildIngredient({ en: 'Water', pt: 'Água' }));
			await repository.create(buildIngredient({ en: 'Coconut water', pt: 'Água de coco' }));
			await repository.create({
				...buildIngredient({ en: 'Triple sec', pt: 'Triple sec' }),
				translations: {
					en: { name: 'Triple sec', description: 'Orange liqueur' },
					pt: { name: 'Triple sec', description: 'Licor de laranja' },
				},
			});
			await repository.create({
				...buildIngredient({ en: 'Licor 43', pt: 'Licor 43' }),
				kind: 'branded',
				brand: 'Cuarenta',
			});
		});

		describe('searching by name', () => {
			it('ignores accents and case', async () => {
				expect(await names({ search: { name: 'AGUA' } })).toEqual(
					expect.arrayContaining(['Água', 'Água de coco']),
				);
				expect(await names({ search: { name: 'água' } })).toHaveLength(2);
			});

			it('finds by the name of the other language', async () => {
				expect(await names({ search: { name: 'coconut' } })).toEqual(['Água de coco']);
			});

			it('matches the start of each word, in any order', async () => {
				expect(await names({ search: { name: 'coc ag' } })).toEqual(['Água de coco']);
				expect(await names({ search: { name: 'oco' } })).toEqual([]);
			});

			it('finds by description and by brand', async () => {
				expect(await names({ search: { name: 'laranja' } })).toEqual(['Triple sec']);
				expect(await names({ search: { name: 'cuarenta' } })).toEqual(['Licor 43']);
			});

			it('ignores the stop words of a multi-word term', async () => {
				expect(await names({ search: { name: 'licor de laranja' } })).toEqual(['Triple sec']);
				expect(await names({ search: { name: 'agua de coco' } })).toEqual(['Água de coco']);
			});

			it('does not match every description that has a stop word', async () => {
				expect(await names({ search: { name: 'e' } })).toEqual([]);
			});

			it('returns nothing when a word of the term is unknown', async () => {
				expect(await names({ search: { name: 'laranja xyz' } })).toEqual([]);
			});

			it('treats a blank term as no filter', async () => {
				expect(await names({ search: { name: '   ' } })).toHaveLength(5);
			});

			it('combines with the sort', async () => {
				expect(await names({ search: { name: 'agua' }, sort: { 'translations.pt.name': 'desc' } })).toEqual([
					'Água de coco',
					'Água',
				]);
			});
		});

		describe('sorting by a translated name', () => {
			it('follows the alphabet of the language, not the binary order', async () => {
				const ascending = await names({ sort: { 'translations.pt.name': 1 } });

				expect(ascending.slice(0, 2)).toEqual(['Água', 'Água de coco']);
				expect(ascending.at(-1)).toBe('Zebra');
				expect(await names({ sort: { 'translations.pt.name': -1 } })).toEqual([...ascending].reverse());
			});
		});
	});

	describe('ids and missing documents', () => {
		const invalidId = 'not-an-object-id';

		it('treats an id that is not an object id as a document that does not exist', async () => {
			expect(await repository.findById(invalidId)).toBeNull();
			await expect(repository.update(withEditor({ id: invalidId, units: [] }))).rejects.toBeInstanceOf(
				NotFoundError,
			);
			await expect(repository.delete(invalidId)).rejects.toBeInstanceOf(NotFoundError);
		});

		it('returns null for an id that is valid but does not exist', async () => {
			expect(await repository.findById(new ObjectId().toString())).toBeNull();
		});

		it.each([
			{ title: 'without touching the names or the brand', data: { units: [] } },
			{ title: 'while changing the names', data: { translations: { en: { name: 'Other' } } } },
			{ title: 'while changing the brand', data: { brand: 'Other' } },
		])('throws NotFoundError when updating a missing document {{title}}', async ({ data }) => {
			await expect(
				repository.update(withEditor({ id: new ObjectId().toString(), ...data })),
			).rejects.toBeInstanceOf(NotFoundError);
		});

		it('deletes the document and returns it', async () => {
			const created = await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

			const deleted = await repository.delete(created.id);

			expect(deleted.id).toBe(created.id);
			expect(await repository.findById(created.id)).toBeNull();
			await expect(repository.delete(created.id)).rejects.toBeInstanceOf(NotFoundError);
		});

		it('returns no ingredient when any id of the list is invalid', async () => {
			const created = await repository.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

			expect(await repository.findByIdList([created.id, invalidId])).toEqual([]);
			expect(await repository.findByIdList([invalidId])).toEqual([]);
		});
	});
});
