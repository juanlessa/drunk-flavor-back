import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
import { Category } from '@/core/drinks/entities/category.entity';
import { DrinkIngredient } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { QueryParams } from '@/shared/types/query.types';

/** What the contract needs to know about a record of any of the catalog repositories. */
export type AuthoredRecord = {
	id: string;
	translations: { en: { name: string } };
	createdBy?: string;
	updatedBy?: string;
	updatedAt: Date;
};

export type CatalogAuthorshipSubject = {
	/** The name of the repository under test, for the title of the suite. */
	label: string;
	/** Runs before each test, e.g. to empty a collection. The repository is built by `repository`. */
	reset?: () => Promise<void>;
	repository: () => {
		findAll(query: QueryParams): Promise<AuthoredRecord[]>;
		findAllOwnedFirst(query: QueryParams, userId: string): Promise<AuthoredRecord[]>;
		findById(id: string): Promise<AuthoredRecord | null>;
		clearCreatorByUser(userId: string): Promise<number>;
	};
	/** Creates a record with the given English name (unique in both languages) and creator. */
	create: (name: string, createdBy: string) => Promise<AuthoredRecord>;
	/** Updates a record, changing only what the test needs and the last editor. */
	update: (id: string, updatedBy: string, extra?: object) => Promise<AuthoredRecord>;
};

/** Snapshots of a category and a unit, for the repositories whose records embed them. */
export const buildCategorySnapshot = (): Category => ({
	id: new ObjectId().toString(),
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
	isAlcoholic: false,
	createdAt: new Date(),
	updatedAt: new Date(),
});

export const buildUnitSnapshot = (): Unit => ({
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

export const buildIngredientSnapshot = (): Ingredient => ({
	id: new ObjectId().toString(),
	translations: { en: { name: 'Gin' }, pt: { name: 'Gin' } },
	category: buildCategorySnapshot(),
	units: [buildUnitSnapshot()],
	kind: 'generic',
	createdAt: new Date(),
	updatedAt: new Date(),
});

export const buildDrinkIngredientSnapshot = (): DrinkIngredient => {
	const ingredient = buildIngredientSnapshot();
	return {
		ingredient,
		amount: { type: DrinkIngredientAmountTypes.exact, quantity: 50, unit: ingredient.units[0] },
		optional: false,
	};
};

const alice = '66b0000000000000000000a1';
const bob = '66b0000000000000000000b2';
const carol = '66b0000000000000000000c3';

const sort = { 'translations.en.name': 'asc' } as const;

/**
 * The authorship behavior every catalog repository (units, categories, ingredients, drinks) must have, whatever its
 * storage: who is recorded on create and update, how the records of a user are listed first, and how a closed account
 * is removed. Run it against the in-memory repository and the Mongo one so the fake used by the unit tests cannot
 * drift from the real one.
 */
export const describeCatalogAuthorshipContract = (subject: CatalogAuthorshipSubject) => {
	const { repository } = subject;
	const namesOf = (records: AuthoredRecord[]) => records.map((record) => record.translations.en.name);

	describe(`${subject.label} authorship contract`, () => {
		beforeEach(async () => {
			await subject.reset?.();
		});

		describe('create', () => {
			it('records the creator as the creator and as the last editor', async () => {
				const created = await subject.create('a1', alice);

				expect(created).toMatchObject({ createdBy: alice, updatedBy: alice });
				expect(await repository().findById(created.id)).toMatchObject({ createdBy: alice, updatedBy: alice });
			});
		});

		describe('update', () => {
			it('changes the last editor and keeps the creator', async () => {
				const created = await subject.create('a1', alice);

				const updated = await subject.update(created.id, bob);

				expect(updated).toMatchObject({ createdBy: alice, updatedBy: bob });
				expect(await repository().findById(created.id)).toMatchObject({ createdBy: alice, updatedBy: bob });
			});

			it('keeps the creator even when the update tries to change it', async () => {
				const created = await subject.create('a1', alice);

				await subject.update(created.id, bob, { createdBy: bob });

				expect(await repository().findById(created.id)).toMatchObject({ createdBy: alice, updatedBy: bob });
			});
		});

		describe('findAll', () => {
			it('lists in the plain order of the query, whoever created the records', async () => {
				await subject.create('b1', bob);
				await subject.create('a1', alice);
				await subject.create('c1', carol);

				expect(namesOf(await repository().findAll({ sort }))).toEqual(['a1', 'b1', 'c1']);
			});
		});

		describe('findAllOwnedFirst', () => {
			// Created in this order: a1 (alice), b1 (bob), a2 (alice), b2 (bob), a3 (alice).
			const seed = async () => {
				await subject.create('a1', alice);
				await subject.create('b1', bob);
				await subject.create('a2', alice);
				await subject.create('b2', bob);
				await subject.create('a3', alice);
			};

			it('lists the records of the user first, then the others, each group in the order of the query', async () => {
				await seed();

				expect(namesOf(await repository().findAllOwnedFirst({ sort }, bob))).toEqual([
					'b1',
					'b2',
					'a1',
					'a2',
					'a3',
				]);
				expect(
					namesOf(await repository().findAllOwnedFirst({ sort: { 'translations.en.name': 'desc' } }, alice)),
				).toEqual(['a3', 'a2', 'a1', 'b2', 'b1']);
			});

			it('shows who created and last edited each record', async () => {
				await seed();

				const [first] = await repository().findAllOwnedFirst({ sort }, bob);

				expect(first).toMatchObject({ createdBy: bob, updatedBy: bob });
			});

			it('keeps the order across pages, including the page that holds both groups', async () => {
				await seed();
				const page = async (number: number) =>
					namesOf(await repository().findAllOwnedFirst({ sort, limit: 2, page: number }, alice));

				expect([await page(1), await page(2), await page(3), await page(4)]).toEqual([
					['a1', 'a2'],
					['a3', 'b1'],
					['b2'],
					[],
				]);
			});

			it('pages through the other records when the user has none', async () => {
				await seed();

				expect(namesOf(await repository().findAllOwnedFirst({ sort, limit: 2, page: 2 }, carol))).toEqual([
					'a3',
					'b1',
				]);
			});

			it('lists only the records of the user when they created all of them', async () => {
				await subject.create('a1', alice);
				await subject.create('a2', alice);

				expect(namesOf(await repository().findAllOwnedFirst({ sort }, alice))).toEqual(['a1', 'a2']);
			});

			it('applies the search to both groups', async () => {
				await seed();

				expect(namesOf(await repository().findAllOwnedFirst({ sort, search: { name: 'a' } }, bob))).toEqual([
					'a1',
					'a2',
					'a3',
				]);
				expect(namesOf(await repository().findAllOwnedFirst({ sort, search: { name: 'b' } }, alice))).toEqual([
					'b1',
					'b2',
				]);
			});

			it('treats the records whose creator closed the account as records of others', async () => {
				await subject.create('a1', alice);
				await subject.create('b1', bob);
				await repository().clearCreatorByUser(alice);

				expect(namesOf(await repository().findAllOwnedFirst({ sort }, bob))).toEqual(['b1', 'a1']);
			});

			it('returns nothing when there are no records', async () => {
				expect(await repository().findAllOwnedFirst({ sort }, alice)).toEqual([]);
			});
		});

		describe('clearCreatorByUser', () => {
			it('removes the user as creator and as last editor, leaving the records', async () => {
				const created = await subject.create('a1', alice);
				await subject.update(created.id, bob);
				const other = await subject.create('b1', bob);
				await subject.update(other.id, alice);

				const touched = await repository().clearCreatorByUser(alice);

				expect(touched).toBe(2);
				const first = await repository().findById(created.id);
				const second = await repository().findById(other.id);
				expect(first).not.toHaveProperty('createdBy');
				expect(first).toMatchObject({ updatedBy: bob });
				expect(second).toMatchObject({ createdBy: bob });
				expect(second).not.toHaveProperty('updatedBy');
			});

			it('counts a record once when the user is both its creator and its last editor', async () => {
				await subject.create('a1', alice);

				expect(await repository().clearCreatorByUser(alice)).toBe(1);
			});

			it('does not change the update date of the records', async () => {
				const created = await subject.create('a1', alice);
				const before = await repository().findById(created.id);

				await repository().clearCreatorByUser(alice);

				expect((await repository().findById(created.id))?.updatedAt).toEqual(before?.updatedAt);
			});

			it('leaves the records of other users alone', async () => {
				const created = await subject.create('b1', bob);

				expect(await repository().clearCreatorByUser(alice)).toBe(0);
				expect(await repository().findById(created.id)).toMatchObject({ createdBy: bob, updatedBy: bob });
			});

			it('does nothing without records', async () => {
				expect(await repository().clearCreatorByUser(alice)).toBe(0);
			});
		});
	});
};
