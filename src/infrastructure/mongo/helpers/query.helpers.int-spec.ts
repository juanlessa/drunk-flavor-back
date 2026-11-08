import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import mongoose, { Model, Schema } from 'mongoose';
import { QueryParams } from '@/shared/types/query.types';
import { buildQuery } from './query.helpers';

type Item = { label: string; rank: number; search_keys: string[] };

// A model of its own keeps this helper test independent of any domain entity.
const ItemModel =
	(mongoose.models['query_helper_items'] as Model<Item> | undefined) ??
	mongoose.model<Item>(
		'query_helper_items',
		new Schema<Item>({ label: String, rank: Number, search_keys: [String] }),
	);

/** Runs the query and returns the labels, in the order the database returned them. */
const labelsOf = async (params: QueryParams, options?: Parameters<typeof buildQuery>[2]) =>
	(await buildQuery<Item>(params, ItemModel, options).lean().exec()).map(({ label }) => label);

describe('buildQuery (integration)', () => {
	beforeAll(async () => {
		await ItemModel.init();
	});

	afterEach(async () => {
		await ItemModel.deleteMany({});
	});

	describe('with a catalog of items', () => {
		// Inserted in this order, so the _id of each item grows with its position.
		const items: Item[] = [
			{ label: 'Água de coco', rank: 2, search_keys: ['agua', 'de', 'coco'] },
			{ label: 'Zebra', rank: 1, search_keys: ['zebra'] },
			{ label: 'Licor de laranja', rank: 2, search_keys: ['licor', 'laranja'] },
			{ label: 'a.b', rank: 3, search_keys: ['a', 'b'] },
			{ label: 'axb', rank: 3, search_keys: ['axb'] },
		];
		const insertionOrder = items.map(({ label }) => label);

		const seed = () => ItemModel.insertMany(items);

		describe('searching the search keys', () => {
			it('matches the start of every word of the term, in any order', async () => {
				await seed();

				expect(await labelsOf({ search: { search_keys: 'coc ag' } })).toEqual(['Água de coco']);
				expect(await labelsOf({ search: { search_keys: 'lar lic' } })).toEqual(['Licor de laranja']);
			});

			it('ignores accents and case in the term', async () => {
				await seed();

				expect(await labelsOf({ search: { search_keys: 'ÁGUA' } })).toEqual(['Água de coco']);
			});

			it('ignores the stop words of a multi-word term', async () => {
				await seed();

				expect(await labelsOf({ search: { search_keys: 'licor de laranja' } })).toEqual(['Licor de laranja']);
			});

			it('keeps a term made only of stop words, so it still narrows the result', async () => {
				await seed();

				// Only "Água de coco" keeps the stop word "de" among its keys.
				expect(await labelsOf({ search: { search_keys: 'de' } })).toEqual(['Água de coco']);
			});

			it('matches nothing when a word of the term is unknown', async () => {
				await seed();

				expect(await labelsOf({ search: { search_keys: 'laranja xyz' } })).toEqual([]);
			});

			it.each([
				{ title: 'a blank term', search: { search_keys: '   ' } },
				{ title: 'a term that is undefined', search: { search_keys: undefined } },
				{ title: 'an empty search', search: {} },
			])('does not filter with $title', async ({ search }) => {
				await seed();

				expect(await labelsOf({ search })).toEqual(insertionOrder);
			});
		});

		describe('searching other fields', () => {
			it('matches a substring ignoring case, but not accents', async () => {
				await seed();

				expect(await labelsOf({ search: { label: 'ZEB' } })).toEqual(['Zebra']);
				expect(await labelsOf({ search: { label: 'ua de' } })).toEqual(['Água de coco']);
				expect(await labelsOf({ search: { label: 'agua' } })).toEqual([]);
			});

			it('escapes the characters of the term instead of using them as a pattern', async () => {
				await seed();

				expect(await labelsOf({ search: { label: 'a.b' } })).toEqual(['a.b']);
			});

			it('ignores a field without a term', async () => {
				await seed();

				expect(await labelsOf({ search: { label: undefined } })).toEqual(insertionOrder);
			});

			it('combines every search field', async () => {
				await seed();

				expect(await labelsOf({ search: { label: 'de', search_keys: 'laranja' } })).toEqual([
					'Licor de laranja',
				]);
			});
		});

		describe('sorting', () => {
			it('keeps the natural order when no sort is given', async () => {
				await seed();

				expect(await labelsOf({})).toEqual(insertionOrder);
			});

			it('sorts ascending and descending, with numbers or words', async () => {
				await seed();

				const ranks = async (sort: QueryParams['sort']) =>
					(await buildQuery<Item>({ sort }, ItemModel).lean().exec()).map(({ rank }) => rank);

				expect(await ranks({ rank: 1 })).toEqual([1, 2, 2, 3, 3]);
				expect(await ranks({ rank: -1 })).toEqual([3, 3, 2, 2, 1]);
				expect(await ranks({ rank: 'asc' })).toEqual([1, 2, 2, 3, 3]);
				expect(await ranks({ rank: 'desc' })).toEqual([3, 3, 2, 2, 1]);
			});

			it('breaks ties with the _id, newest first, so pages stay stable', async () => {
				await seed();

				expect(await labelsOf({ sort: { rank: 1 } })).toEqual([
					'Zebra',
					'Licor de laranja', // rank 2, newer than "Água de coco"
					'Água de coco',
					'axb', // rank 3, newer than "a.b"
					'a.b',
				]);
			});

			it('ignores the sort fields that have no order', async () => {
				await seed();

				expect(await labelsOf({ sort: { rank: 1, label: undefined } })).toEqual(
					await labelsOf({ sort: { rank: 1 } }),
				);
			});

			it('honors a sort by _id instead of adding its own tie-breaker', async () => {
				await seed();

				expect(await labelsOf({ sort: { _id: 1 } })).toEqual(insertionOrder);
				expect(await labelsOf({ sort: { _id: -1 } })).toEqual([...insertionOrder].reverse());
			});
		});

		describe('paginating', () => {
			it('skips the previous pages and limits the page size', async () => {
				await seed();

				expect(await labelsOf({ sort: { _id: 1 }, limit: 2, page: 1 })).toEqual(insertionOrder.slice(0, 2));
				expect(await labelsOf({ sort: { _id: 1 }, limit: 2, page: 2 })).toEqual(insertionOrder.slice(2, 4));
				expect(await labelsOf({ sort: { _id: 1 }, limit: 2, page: 3 })).toEqual(insertionOrder.slice(4));
			});

			it('returns the first page by default', async () => {
				await seed();

				expect(await labelsOf({ sort: { _id: 1 } })).toEqual(insertionOrder);
			});
		});
	});

	describe('with a collation', () => {
		const seed = () => ItemModel.insertMany([{ label: 'Zebra' }, { label: 'Água' }, { label: 'Cerveja' }]);

		it('sorts by the binary order of the characters when none is given', async () => {
			await seed();

			expect(await labelsOf({ sort: { label: 1 } })).toEqual(['Cerveja', 'Zebra', 'Água']);
		});

		it('sorts by the alphabet of the language when one is given', async () => {
			await seed();

			expect(await labelsOf({ sort: { label: 1 } }, { collation: { locale: 'pt' } })).toEqual([
				'Água',
				'Cerveja',
				'Zebra',
			]);
			expect(await labelsOf({ sort: { label: -1 } }, { collation: { locale: 'pt' } })).toEqual([
				'Zebra',
				'Cerveja',
				'Água',
			]);
		});
	});
});
