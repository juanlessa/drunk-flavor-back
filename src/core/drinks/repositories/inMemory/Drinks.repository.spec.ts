import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { DrinksRepositoryInMemory } from './Drinks.repository';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { NotFoundError } from '@/shared/error/error.lib';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';

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

let repository: DrinksRepositoryInMemory;

describe('DrinksRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new DrinksRepositoryInMemory();
	});

	it('forces cover/thumbnail to undefined and aggregate fields to zero, assigning id and timestamps', async () => {
		const created = await repository.create({
			translations: {
				en: { name: 'Caipirinha', method: 'Muddle and stir' },
				pt: { name: 'Caipirinha', method: 'Macere e mexa' },
			},
			ingredients: [createDrinkIngredientFactory(buildIngredient())],
		});

		expect(created.cover).toBeUndefined();
		expect(created.thumbnail).toBeUndefined();
		expect(created.avgRating).toBe(0);
		expect(created.ratingsCount).toBe(0);
		expect(created.id).toEqual(expect.any(String));
		expect(created.id).not.toHaveLength(0);
		expect(created.createdAt).toBeInstanceOf(Date);
		expect(created.updatedAt).toBeInstanceOf(Date);
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

	it('deep-merges on update and refreshes updatedAt', async () => {
		const created = await repository.create({
			translations: {
				en: { name: 'Negroni', method: 'Stir' },
				pt: { name: 'Negroni', method: 'Mexa' },
			},
			ingredients: [],
		});
		const originalUpdatedAt = created.updatedAt.getTime();

		const updated = await repository.update({
			id: created.id,
			translations: { en: { name: 'Negroni Sbagliato' } },
		});

		expect(updated.translations.en.name).toBe('Negroni Sbagliato');
		// Untouched fields are preserved by the deep merge.
		expect(updated.translations.en.method).toBe('Stir');
		expect(updated.translations.pt.name).toBe('Negroni');
		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});

	it('throws NotFoundError when deleting a missing id', async () => {
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
	});

	it('applies rating deltas and resets the average when the count reaches zero', async () => {
		const drink = await repository.create({
			translations: { en: { name: 'Rated', method: 'm' }, pt: { name: 'Avaliado', method: 'm' } },
			ingredients: [],
		});

		await expect(repository.applyRatingDelta({ drinkId: drink.id, countDelta: 1, sumDelta: 4 })).resolves.toEqual({
			average: 4,
			count: 1,
		});
		await expect(repository.applyRatingDelta({ drinkId: drink.id, countDelta: -1, sumDelta: -4 })).resolves.toEqual(
			{
				average: 0,
				count: 0,
			},
		);
		expect(await repository.findById(drink.id)).toMatchObject({ avgRating: 0, ratingsCount: 0, ratingsSum: 0 });
	});

	it('rejects rating deltas for missing drinks and aggregate underflow', async () => {
		await expect(
			repository.applyRatingDelta({ drinkId: 'missing-drink', countDelta: 1, sumDelta: 4 }),
		).rejects.toBeInstanceOf(NotFoundError);
		const drink = await repository.create({
			translations: { en: { name: 'Empty', method: 'm' }, pt: { name: 'Vazio', method: 'm' } },
			ingredients: [],
		});
		await expect(repository.applyRatingDelta({ drinkId: drink.id, countDelta: -1, sumDelta: -1 })).rejects.toThrow(
			'Rating projection invariant violated',
		);
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

	it('creates a drink without garnishes by default and keeps the ones given', async () => {
		const ingredient = buildIngredient();
		const plain = await repository.create({
			translations: { en: { name: 'Plain', method: 'm' }, pt: { name: 'Simples', method: 'm' } },
			ingredients: [createDrinkIngredientFactory(ingredient)],
		});
		const garnished = await repository.create({
			translations: { en: { name: 'Garnished', method: 'm' }, pt: { name: 'Decorado', method: 'm' } },
			ingredients: [createDrinkIngredientFactory(ingredient)],
			garnishes: [{ ingredient, amount: { type: 'none' } }],
		});

		expect(plain.garnishes).toEqual([]);
		expect(garnished.garnishes).toEqual([{ ingredient, amount: { type: 'none' } }]);
	});

	it('replaces the ingredients and the garnishes on update, and clears the garnishes with an empty list', async () => {
		const ingredient = buildIngredient();
		const created = await repository.create({
			translations: { en: { name: 'Mojito', method: 'm' }, pt: { name: 'Mojito', method: 'm' } },
			ingredients: [createDrinkIngredientFactory(ingredient)],
			garnishes: [{ ingredient, amount: { type: 'none' } }],
		});

		const replaced = await repository.update({
			id: created.id,
			garnishes: [{ ingredient, amount: { type: 'qualitative', qualifier: 'to_taste' } }],
		});
		const cleared = await repository.update({ id: created.id, garnishes: [] });

		expect(replaced.garnishes).toEqual([{ ingredient, amount: { type: 'qualitative', qualifier: 'to_taste' } }]);
		expect(cleared.garnishes).toEqual([]);
		expect(cleared.ingredients).toHaveLength(1);
	});

	it('finds a drink by name ignoring accents and case', async () => {
		await repository.create({
			translations: { en: { name: 'Pina colada', method: 'm' }, pt: { name: 'Piña colada', method: 'm' } },
			ingredients: [],
		});

		expect(await repository.findByName({ pt: { name: 'PINA COLADA' } })).not.toBeNull();
		expect(await repository.findAll({ search: { name: 'pina' } })).toHaveLength(1);
	});
	describe('preparation plan', () => {
		const plan: PreparationPlan = {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [{ type: 'prepare_glass', mode: 'chill' }],
		};
		const otherPlan: PreparationPlan = { ...plan, servingGlass: 'rocks' };
		const translations = { en: { name: 'Sour', method: 'm' }, pt: { name: 'Sour', method: 'm' } };

		it('keeps the plan given on create, and has none by default', async () => {
			const withPlan = await repository.create({ translations, ingredients: [], preparation: plan });
			const withoutPlan = await repository.create({
				translations: { en: { name: 'Fizz', method: 'm' }, pt: { name: 'Fizz', method: 'm' } },
				ingredients: [],
			});

			expect(withPlan.preparation).toEqual(plan);
			expect(withoutPlan.preparation).toBeUndefined();
		});

		it('sets the plan of a drink that had none, and replaces a stored plan', async () => {
			const created = await repository.create({ translations, ingredients: [] });

			const set = await repository.update({ id: created.id, preparation: plan });
			const replaced = await repository.update({ id: created.id, preparation: otherPlan });

			expect(set.preparation).toEqual(plan);
			expect(replaced.preparation).toEqual(otherPlan);
		});

		it('keeps the stored plan when an update leaves it out, and removes it with null', async () => {
			const created = await repository.create({ translations, ingredients: [], preparation: plan });

			const untouched = await repository.update({ id: created.id, garnishes: [] });
			const removed = await repository.update({ id: created.id, preparation: null });

			expect(untouched.preparation).toEqual(plan);
			expect(removed.preparation).toBeUndefined();
			expect(removed).not.toHaveProperty('preparation');
		});
	});
});
