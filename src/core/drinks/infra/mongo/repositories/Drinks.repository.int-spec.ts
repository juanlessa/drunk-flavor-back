import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { DrinksRepository } from './Drinks.repository';
import { DrinkModel } from '../entities/drink.model';
import { CreateDrink } from '@/core/drinks/dtos/drink.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { describeFindByIngredientsContract } from '@/core/drinks/repositories/testing/findByIngredients.contract';
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

const buildIngredient = (): Ingredient => ({
	id: new ObjectId().toString(),
	translations: { en: { name: 'Lime' }, pt: { name: 'Limão' } },
	category: buildCategory(),
	units: [buildUnit()],
	kind: 'generic',
	createdAt: new Date(),
	updatedAt: new Date(),
});

const buildDrink = (name: { en: string; pt: string }): CreateDrink => ({
	translations: {
		en: { name: name.en, method: 'Stir' },
		pt: { name: name.pt, method: 'Mexa' },
	},
	ingredients: [createDrinkIngredientFactory(buildIngredient())],
});

// A plan with keys that need renaming at every depth: lists of actions, references and optional fields.
const buildPlan = (): PreparationPlan => ({
	mixingVessel: 'shaker',
	servingGlass: 'nick_and_nora',
	actions: [
		{ type: 'prepare_glass', mode: 'rim', item: { list: 'garnishes', ingredientId: 'salt' }, coverage: 'half' },
		{
			type: 'add',
			target: 'mixing',
			items: [{ list: 'ingredients', ingredientId: 'gin', unitId: 'ml', withUnit: true }],
		},
		{ type: 'add_ice', target: 'mixing', kind: 'large_cube' },
		{ type: 'strain', kind: 'double', to: 'serving', overIce: true },
		{
			type: 'custom',
			text: { en: 'Serve.', pt: 'Sirva.' },
			items: [{ list: 'garnishes', ingredientId: 'cherry' }],
		},
	],
});

let repository: DrinksRepository;

describe('DrinksRepository (integration)', () => {
	beforeAll(async () => {
		await DrinkModel.init();
	});

	beforeEach(() => {
		repository = new DrinksRepository();
	});

	afterEach(async () => {
		await DrinkModel.deleteMany({});
	});

	it('returns lean documents without __v', async () => {
		const created = await repository.create(buildDrink({ en: 'Caipirinha', pt: 'Caipirinha BR' }));

		const byId = await repository.findById(created.id);
		const byName = await repository.findByName({ en: { name: 'Caipirinha' } });
		const [listed] = await repository.findAll({});

		expect(byId as Record<string, unknown>).not.toHaveProperty('__v');
		expect(byName as Record<string, unknown>).not.toHaveProperty('__v');
		expect(listed as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('round-trips a drink with nested ingredient embedding category and units', async () => {
		const created = await repository.create(buildDrink({ en: 'Mojito', pt: 'Mojito BR' }));
		const byId = await repository.findById(created.id);

		expect(byId?.ingredients).toHaveLength(1);
		expect(byId?.ingredients[0].amount).toMatchObject({ type: 'exact', quantity: 60 });
		expect(byId?.ingredients[0].ingredient.translations.en.name).toBe('Lime');
		expect(byId?.ingredients[0].ingredient.category.translations.en.name).toBe('Syrup');
		expect(byId?.ingredients[0].ingredient.units[0].translations.en.name).toBe('milliliter');
	});

	it('finds by name across languages and returns null on no match', async () => {
		await repository.create(buildDrink({ en: 'Negroni', pt: 'Negroni BR' }));

		expect(await repository.findByName({ en: { name: 'Negroni' } })).not.toBeNull();
		expect(await repository.findByName({ pt: { name: 'Negroni BR' } })).not.toBeNull();
		expect(await repository.findByName({ en: { name: 'Nonexistent' } })).toBeNull();
	});

	it('throws NotFoundError on update/delete of a missing id and returns the updated doc on success', async () => {
		await expect(
			repository.update({ id: new ObjectId().toString(), translations: { en: { name: 'X' } } }),
		).rejects.toBeInstanceOf(NotFoundError);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(buildDrink({ en: 'Daiquiri', pt: 'Daiquiri BR' }));
		const updated = await repository.update({
			id: created.id,
			translations: { en: { name: 'Daiquiri Reserve' } },
		});
		expect(updated.translations.en.name).toBe('Daiquiri Reserve');
	});

	it('translates a sequential duplicate en/pt name create to ConflictError', async () => {
		await repository.create(buildDrink({ en: 'Margarita', pt: 'Margarita BR' }));

		await expect(repository.create(buildDrink({ en: 'Margarita', pt: 'Outro' }))).rejects.toBeInstanceOf(
			ConflictError,
		);
		await expect(repository.create(buildDrink({ en: 'Other', pt: 'Margarita BR' }))).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('resolves a concurrent create race to one persisted doc and one domain rejection', async () => {
		const results = await Promise.allSettled([
			repository.create(buildDrink({ en: 'Gimlet', pt: 'Gimlet BR' })),
			repository.create(buildDrink({ en: 'Gimlet', pt: 'Gimlet BR' })),
		]);

		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
		expect(rejected).toHaveLength(1);
		expect(rejected[0].reason).toBeInstanceOf(ConflictError);

		expect(await DrinkModel.countDocuments({ 'translations.en.name': 'Gimlet' })).toBe(1);
	});

	it('translates an update rename collision to ConflictError', async () => {
		await repository.create(buildDrink({ en: 'Margarita', pt: 'Margarita BR' }));
		const other = await repository.create(buildDrink({ en: 'Paloma', pt: 'Paloma BR' }));

		await expect(
			repository.update({ id: other.id, translations: { en: { name: 'Margarita' } } }),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('orders findAll deterministically with the _id tie-breaker under equal sort keys', async () => {
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await DrinkModel.collection.insertMany(
			ids.map((id, index) => ({
				_id: id,
				translations: {
					en: { name: `Drink ${index}`, method: 'm' },
					pt: { name: `Drink PT ${index}`, method: 'm' },
				},
				ingredients: [],
				avg_rating: 0,
				ratings_count: 0,
				created_at: sharedDate,
				updated_at: sharedDate,
			})),
		);

		const expectedOrder = [...ids].map((id) => id.toString()).sort((a, b) => (a > b ? -1 : 1));

		const firstPage = await repository.findAll({ page: 1, limit: 2, sort: { createdAt: -1 } });
		const secondPage = await repository.findAll({ page: 2, limit: 2, sort: { createdAt: -1 } });

		expect(firstPage.map((item) => item.id)).toEqual(expectedOrder.slice(0, 2));
		expect(secondPage.map((item) => item.id)).toEqual(expectedOrder.slice(2, 3));
	});

	it('applies rating deltas atomically and recalculates the average', async () => {
		const drink = await repository.create(buildDrink({ en: 'Rated drink', pt: 'Drink avaliado' }));

		await Promise.all(
			[5, 4, 3, 2].map((value) =>
				repository.applyRatingDelta({ drinkId: drink.id, countDelta: 1, sumDelta: value }),
			),
		);
		await expect(repository.applyRatingDelta({ drinkId: drink.id, countDelta: 0, sumDelta: 2 })).resolves.toEqual({
			average: 4,
			count: 4,
		});
		await expect(repository.applyRatingDelta({ drinkId: drink.id, countDelta: -1, sumDelta: -2 })).resolves.toEqual(
			{
				average: 14 / 3,
				count: 3,
			},
		);

		const found = await repository.findById(drink.id);
		expect(found).toMatchObject({ ratingsCount: 3, avgRating: 14 / 3 });
		expect(found).not.toHaveProperty('ratingsSum');
		// The sum behind the average stays stored, but only in the persistence layer.
		const stored = await DrinkModel.findById(drink.id).select('+ratings_sum').lean();
		expect(stored?.ratings_sum).toBe(14);
	});

	it('rejects missing-drink and aggregate-underflow rating deltas without mutation', async () => {
		await expect(
			repository.applyRatingDelta({ drinkId: new ObjectId().toString(), countDelta: 1, sumDelta: 4 }),
		).rejects.toBeInstanceOf(NotFoundError);
		const drink = await repository.create(buildDrink({ en: 'Empty drink', pt: 'Drink vazio' }));
		await expect(
			repository.applyRatingDelta({ drinkId: drink.id, countDelta: -1, sumDelta: -1 }),
		).rejects.toBeInstanceOf(NotFoundError);
		expect(await repository.findById(drink.id)).toMatchObject({ ratingsCount: 0, avgRating: 0 });
		expect((await DrinkModel.findById(drink.id).select('+ratings_sum').lean())?.ratings_sum).toBe(0);
		expect(await repository.findById('invalid-id')).toBeNull();
	});

	it('succeeds with no sort supplied', async () => {
		await repository.create(buildDrink({ en: 'Caipirinha', pt: 'Caipirinha BR' }));
		await expect(repository.findAll({})).resolves.toHaveLength(1);
	});

	describe('ingredients and garnishes', () => {
		it('creates a drink without garnishes by default', async () => {
			const created = await repository.create(buildDrink({ en: 'Plain', pt: 'Simples' }));

			expect(created.garnishes).toEqual([]);
			expect((await repository.findById(created.id))?.garnishes).toEqual([]);
		});

		it('round-trips the garnishes apart from the ingredients, with the unit snapshots intact', async () => {
			const lime = buildIngredient();
			const mint = { ...buildIngredient(), id: new ObjectId().toString() };
			const created = await repository.create({
				...buildDrink({ en: 'Mojito', pt: 'Mojito BR' }),
				ingredients: [createDrinkIngredientFactory(mint)],
				garnishes: [
					{ ingredient: lime, amount: { type: 'exact', quantity: 2, unit: lime.units[0] } },
					{ ingredient: mint, amount: { type: 'none' } },
				],
			});

			const byId = await repository.findById(created.id);

			expect(byId?.ingredients).toHaveLength(1);
			expect(byId?.garnishes).toHaveLength(2);
			expect(byId?.garnishes[0].ingredient.id).toBe(lime.id);
			expect(byId?.garnishes[0].amount).toMatchObject({ type: 'exact', quantity: 2 });
			expect(byId?.garnishes[1].amount).toEqual({ type: 'none' });
			expect(byId?.garnishes[0]).not.toHaveProperty('optional');
			const garnishAmount = byId?.garnishes[0].amount;
			expect(garnishAmount && 'unit' in garnishAmount ? garnishAmount.unit?.id : undefined).toBe(
				lime.units[0].id,
			);
		});

		it('keeps the optional flag of each ingredient', async () => {
			const created = await repository.create({
				...buildDrink({ en: 'Mule', pt: 'Mule BR' }),
				ingredients: [
					createDrinkIngredientFactory(buildIngredient()),
					{
						...createDrinkIngredientFactory(buildIngredient(), { amount: { type: 'none' } }),
						optional: true,
					},
				],
			});

			const byId = await repository.findById(created.id);

			expect(byId?.ingredients.map(({ optional }) => optional)).toEqual([false, true]);
		});

		it('round-trips the qualitative amounts with and without an approximate hint', async () => {
			const ingredient = buildIngredient();
			const created = await repository.create({
				...buildDrink({ en: 'Tonic', pt: 'Tônica' }),
				ingredients: [
					{
						ingredient,
						amount: { type: 'qualitative', qualifier: 'top_up', quantity: 120, unit: ingredient.units[0] },
						optional: false,
					},
					{ ingredient, amount: { type: 'qualitative', qualifier: 'to_taste' }, optional: false },
				],
			});

			const [withHint, withoutHint] = (await repository.findById(created.id))?.ingredients ?? [];

			expect(withHint.amount).toMatchObject({ type: 'qualitative', qualifier: 'top_up', quantity: 120 });
			expect(withHint.amount).toHaveProperty('unit');
			expect(withoutHint.amount).toEqual({ type: 'qualitative', qualifier: 'to_taste' });
		});

		it('replaces the ingredients and the garnishes on update, and clears the garnishes with an empty list', async () => {
			const created = await repository.create({
				...buildDrink({ en: 'Mojito', pt: 'Mojito BR' }),
				garnishes: [{ ingredient: buildIngredient(), amount: { type: 'none' } }],
			});
			const next = buildIngredient();

			const replaced = await repository.update({
				id: created.id,
				ingredients: [createDrinkIngredientFactory(next, { quantity: 10 })],
				garnishes: [{ ingredient: next, amount: { type: 'qualitative', qualifier: 'as_needed' } }],
			});
			const cleared = await repository.update({ id: created.id, garnishes: [] });

			expect(replaced.ingredients).toHaveLength(1);
			expect(replaced.ingredients[0].ingredient.id).toBe(next.id);
			expect(replaced.garnishes).toHaveLength(1);
			expect(cleared.garnishes).toEqual([]);
			expect(cleared.ingredients).toHaveLength(1);
		});

		it('does not touch the garnishes when an update leaves them out', async () => {
			const garnish = { ingredient: buildIngredient(), amount: { type: 'none' as const } };
			const created = await repository.create({
				...buildDrink({ en: 'Mojito', pt: 'Mojito BR' }),
				garnishes: [garnish],
			});

			const updated = await repository.update({ id: created.id, translations: { en: { name: 'Mojito 2' } } });

			expect(updated.garnishes).toHaveLength(1);
		});
	});

	describe('search keys', () => {
		const rawSearchKeys = async (id: string) =>
			(await DrinkModel.findById(id).select('+search_keys').lean())?.search_keys;

		it('are built from the names of both languages and are not exposed on the drink', async () => {
			const created = await repository.create(buildDrink({ en: 'Pina colada', pt: 'Piña colada' }));

			expect(await rawSearchKeys(created.id)).toEqual(['pina', 'colada']);
			expect(created).not.toHaveProperty('searchKeys');
			expect(await repository.findById(created.id)).not.toHaveProperty('searchKeys');
		});

		it('are recalculated when a name changes', async () => {
			const created = await repository.create(buildDrink({ en: 'Mojito', pt: 'Mojito BR' }));

			await repository.update({ id: created.id, translations: { en: { name: 'Cosmopolitan' } } });

			const keys = (await rawSearchKeys(created.id)) ?? [];
			expect(keys).toEqual(expect.arrayContaining(['cosmopolitan', 'mojito', 'br']));
			expect(keys).toHaveLength(3);
		});

		it('are left alone by an update that does not change the names', async () => {
			const created = await repository.create(buildDrink({ en: 'Mojito', pt: 'Mojito BR' }));
			const before = await rawSearchKeys(created.id);

			await repository.update({ id: created.id, garnishes: [] });

			expect(await rawSearchKeys(created.id)).toEqual(before);
		});

		it('make findAll ignore accents, case and the language, and sort by the alphabet of the language', async () => {
			await repository.create(buildDrink({ en: 'Zombie', pt: 'Zumbi' }));
			await repository.create(buildDrink({ en: 'Aperol spritz', pt: 'Ápice' }));
			await repository.create(buildDrink({ en: 'Pina colada', pt: 'Piña colada' }));

			const found = await repository.findAll({ search: { name: 'PINA' } });
			const byEnglishName = await repository.findAll({ search: { name: 'spritz' } });
			const sorted = await repository.findAll({ sort: { 'translations.pt.name': 1 } });

			expect(found.map(({ translations }) => translations.pt.name)).toEqual(['Piña colada']);
			expect(byEnglishName.map(({ translations }) => translations.pt.name)).toEqual(['Ápice']);
			expect(sorted.map(({ translations }) => translations.pt.name)).toEqual(['Ápice', 'Piña colada', 'Zumbi']);
		});

		it('find a drink by name ignoring accents and case', async () => {
			await repository.create(buildDrink({ en: 'Pina colada', pt: 'Piña colada' }));

			expect(await repository.findByName({ pt: { name: 'PINA COLADA' } })).not.toBeNull();
			expect(await repository.findByName({ en: { name: 'piña colada' } })).not.toBeNull();
			expect(await repository.findByName({ en: { name: 'Colada' } })).toBeNull();
		});

		it('reject a name that only differs by accents or case', async () => {
			await repository.create(buildDrink({ en: 'Pina colada', pt: 'Piña colada' }));

			await expect(repository.create(buildDrink({ en: 'PIÑA COLADA', pt: 'Outro' }))).rejects.toBeInstanceOf(
				ConflictError,
			);
		});
	});

	describe('ids and missing documents', () => {
		const invalidId = 'not-an-object-id';

		it('treats an id that is not an object id as a document that does not exist', async () => {
			expect(await repository.findById(invalidId)).toBeNull();
			await expect(repository.update({ id: invalidId, garnishes: [] })).rejects.toBeInstanceOf(NotFoundError);
			await expect(repository.delete(invalidId)).rejects.toBeInstanceOf(NotFoundError);
		});

		it('returns null for an id that is valid but does not exist', async () => {
			expect(await repository.findById(new ObjectId().toString())).toBeNull();
		});

		it.each([
			{ title: 'without touching the names', data: { garnishes: [] } },
			{ title: 'while changing the names', data: { translations: { en: { name: 'Other' } } } },
		])('throws NotFoundError when updating a missing document {{title}}', async ({ data }) => {
			await expect(repository.update({ id: new ObjectId().toString(), ...data })).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});

		it('deletes the document and returns it', async () => {
			const created = await repository.create(buildDrink({ en: 'Caipirinha', pt: 'Caipirinha BR' }));

			const deleted = await repository.delete(created.id);

			expect(deleted.id).toBe(created.id);
			expect(await repository.findById(created.id)).toBeNull();
			await expect(repository.delete(created.id)).rejects.toBeInstanceOf(NotFoundError);
		});
	});
	describe('preparation plan', () => {
		const rawPlan = async (id: string) => (await DrinkModel.findById(id).lean())?.preparation;

		it('stores the plan with snake_case keys at every depth and reads it back unchanged', async () => {
			const plan = buildPlan();

			const created = await repository.create({
				...buildDrink({ en: 'Sour', pt: 'Sour BR' }),
				preparation: plan,
			});
			const reloaded = await repository.findById(created.id);

			expect(created.preparation).toEqual(plan);
			expect(reloaded?.preparation).toEqual(plan);
			expect(await rawPlan(created.id)).toMatchObject({
				mixing_vessel: 'shaker',
				serving_glass: 'nick_and_nora',
				actions: [
					{ item: { ingredient_id: 'salt' } },
					{ items: [{ ingredient_id: 'gin', unit_id: 'ml', with_unit: true }] },
					{ kind: 'large_cube' },
					{ over_ice: true },
					{ items: [{ ingredient_id: 'cherry' }] },
				],
			});
		});

		it('has no plan when the drink was created without one', async () => {
			const created = await repository.create(buildDrink({ en: 'Fizz', pt: 'Fizz BR' }));

			expect(created.preparation).toBeUndefined();
			expect(await rawPlan(created.id)).toBeUndefined();
		});

		it('sets the plan of a drink that had none', async () => {
			const created = await repository.create(buildDrink({ en: 'Fizz', pt: 'Fizz BR' }));

			const updated = await repository.update({ id: created.id, preparation: buildPlan() });

			expect(updated.preparation).toEqual(buildPlan());
		});

		it('replaces the stored plan, leaving nothing of the old actions behind', async () => {
			const created = await repository.create({
				...buildDrink({ en: 'Sour', pt: 'Sour BR' }),
				preparation: buildPlan(),
			});
			const replacement: PreparationPlan = {
				mixingVessel: 'mixing_glass',
				servingGlass: 'rocks',
				actions: [{ type: 'stir', seconds: 20 }],
			};

			const updated = await repository.update({ id: created.id, preparation: replacement });

			expect(updated.preparation).toEqual(replacement);
			expect(await rawPlan(created.id)).toEqual({
				mixing_vessel: 'mixing_glass',
				serving_glass: 'rocks',
				actions: [{ type: 'stir', seconds: 20 }],
			});
		});

		it('removes the plan from the document with null', async () => {
			const created = await repository.create({
				...buildDrink({ en: 'Sour', pt: 'Sour BR' }),
				preparation: buildPlan(),
			});

			const updated = await repository.update({ id: created.id, preparation: null });

			expect(updated.preparation).toBeUndefined();
			expect(await rawPlan(created.id)).toBeUndefined();
			expect(await DrinkModel.countDocuments({ _id: created.id, preparation: { $exists: true } })).toBe(0);
		});

		it('keeps the plan when an update leaves it out', async () => {
			const created = await repository.create({
				...buildDrink({ en: 'Sour', pt: 'Sour BR' }),
				preparation: buildPlan(),
			});

			const updated = await repository.update({ id: created.id, translations: { en: { name: 'Sour 2' } } });

			expect(updated.preparation).toEqual(buildPlan());
		});
	});

	describeFindByIngredientsContract(() => repository);

	describe('search by ingredients, on Mongo', () => {
		const rawRequiredIds = async (id: string) => {
			const raw = await DrinkModel.collection.findOne({ _id: new ObjectId(id) });
			return (raw?.['required_ingredient_ids'] as ObjectId[] | undefined)?.map((value) => value.toHexString());
		};
		const gin = { ...buildIngredient(), translations: { en: { name: 'Gin' }, pt: { name: 'Gin' } } };
		const lime = buildIngredient();
		const sugar = { ...buildIngredient(), translations: { en: { name: 'Sugar' }, pt: { name: 'Açúcar' } } };
		const recipe = (name: string, ingredients: Ingredient[], optional: Ingredient[] = []): CreateDrink => ({
			...buildDrink({ en: name, pt: name }),
			ingredients: [
				...ingredients.map((ingredient) => createDrinkIngredientFactory(ingredient)),
				...optional.map((ingredient) => createDrinkIngredientFactory(ingredient, { optional: true })),
			],
		});

		it('stores the ids of the required ingredients once, leaving out the optional ones and the garnishes', async () => {
			const created = await repository.create({
				...recipe('Gimlet', [gin, gin, lime], [sugar]),
				garnishes: [{ ingredient: sugar, amount: { type: 'none' } }],
			});

			expect(await rawRequiredIds(created.id)).toEqual([gin.id, lime.id]);
		});

		it('stores an empty list for a drink whose ingredients are all optional', async () => {
			const created = await repository.create(recipe('Only optional', [], [gin]));

			expect(await rawRequiredIds(created.id)).toEqual([]);
		});

		it('follows the recipe when an update replaces the ingredients', async () => {
			const created = await repository.create(recipe('Gimlet', [gin, lime]));

			await repository.update({ id: created.id, ingredients: recipe('Gimlet', [sugar], [gin]).ingredients });

			expect(await rawRequiredIds(created.id)).toEqual([sugar.id]);
			expect(await repository.findByIngredients({ ingredientIds: [gin.id, lime.id], maxMissing: 'any' })).toEqual(
				[],
			);
			expect(
				(await repository.findByIngredients({ ingredientIds: [sugar.id], maxMissing: 0 })).map(
					({ drink }) => drink.id,
				),
			).toEqual([created.id]);
		});

		it('keeps the ids when an update does not touch the ingredients', async () => {
			const created = await repository.create(recipe('Gimlet', [gin, lime]));

			await repository.update({ id: created.id, translations: { en: { name: 'Gimlet renamed' } } });

			expect(await rawRequiredIds(created.id)).toEqual([gin.id, lime.id]);
		});

		it('keeps the ids away from the drink the repository returns', async () => {
			const created = await repository.create(recipe('Gimlet', [gin, lime]));

			const [byId, byName, listed] = await Promise.all([
				repository.findById(created.id),
				repository.findByName({ en: { name: 'Gimlet' } }),
				repository.findAll({}).then(([drink]) => drink),
			]);

			for (const drink of [created, byId, byName, listed]) {
				expect(drink).not.toHaveProperty('requiredIngredientIds');
				expect(drink).not.toHaveProperty('required_ingredient_ids');
			}
		});

		it('returns the drink without the fields only the persistence layer knows', async () => {
			const created = await repository.create(recipe('Gimlet', [gin, lime]));
			await repository.applyRatingDelta({ drinkId: created.id, countDelta: 1, sumDelta: 4 });

			const [match] = await repository.findByIngredients({ ingredientIds: [gin.id], maxMissing: 'any' });

			expect(match?.drink).toMatchObject({ avgRating: 4, ratingsCount: 1 });
			for (const field of ['ratingsSum', 'ratings_sum', 'searchKeys', 'search_keys', 'requiredIngredientIds']) {
				expect(match?.drink).not.toHaveProperty(field);
			}
		});

		it('returns nothing when an ingredient id is not a valid ObjectId', async () => {
			await repository.create(recipe('Gimlet', [gin, lime]));

			await expect(
				repository.findByIngredients({ ingredientIds: [gin.id, 'not-an-id'], maxMissing: 'any' }),
			).resolves.toEqual([]);
		});
	});

	describe('sorting by rating', () => {
		const createRated = async (name: { en: string; pt: string }, rating?: number) => {
			const drink = await repository.create(buildDrink(name));
			if (rating !== undefined) {
				await repository.applyRatingDelta({ drinkId: drink.id, countDelta: 1, sumDelta: rating });
			}
			return drink;
		};
		const ptNames = (drinks: { translations: { pt: { name: string } } }[]) =>
			drinks.map(({ translations }) => translations.pt.name);

		beforeEach(async () => {
			await createRated({ en: 'Zombie', pt: 'Zumbi' }, 4);
			await createRated({ en: 'Apex', pt: 'Ápice' }, 4);
			await createRated({ en: 'Mojito', pt: 'Mojito' });
			await createRated({ en: 'Negroni', pt: 'Negroni' }, 5);
			await createRated({ en: 'Caipirinha', pt: 'caipirinha' }, 5);
		});

		it('puts the best rated first and the drinks with no rating last', async () => {
			const sorted = await repository.findAll({ sort: { avgRating: 'desc' } });

			expect(sorted.map(({ avgRating }) => avgRating)).toEqual([5, 5, 4, 4, 0]);
		});

		it('breaks the ties by name in the alphabet of the language, ignoring accents and case', async () => {
			const sorted = await repository.findAll({ sort: { avgRating: 'desc', 'translations.pt.name': 'asc' } });

			expect(ptNames(sorted)).toEqual(['caipirinha', 'Negroni', 'Ápice', 'Zumbi', 'Mojito']);
		});

		it('breaks the ties by the name of the language asked for', async () => {
			const sorted = await repository.findAll({ sort: { avgRating: 'desc', 'translations.en.name': 'asc' } });

			expect(sorted.map(({ translations }) => translations.en.name)).toEqual([
				'Caipirinha',
				'Negroni',
				'Apex',
				'Zombie',
				'Mojito',
			]);
		});

		it('sorts by the name first when the name comes first', async () => {
			const sorted = await repository.findAll({ sort: { 'translations.pt.name': 'asc', avgRating: 'desc' } });

			expect(ptNames(sorted)).toEqual(['Ápice', 'caipirinha', 'Mojito', 'Negroni', 'Zumbi']);
		});

		it('pages through the sorted drinks without repeating or skipping one', async () => {
			const sort = { avgRating: 'desc', 'translations.pt.name': 'asc' } as const;

			const pages = await Promise.all([1, 2, 3].map((page) => repository.findAll({ sort, limit: 2, page })));

			expect(pages.map(ptNames)).toEqual([['caipirinha', 'Negroni'], ['Ápice', 'Zumbi'], ['Mojito']]);
		});
	});
});
