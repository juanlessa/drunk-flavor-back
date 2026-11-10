import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import mongoose, { Model, Schema } from 'mongoose';
import { QueryParams } from '@/shared/types/query.types';
import { buildQuery, findOwnedFirst } from './query.helpers';

type Item = { label: string; rank: number; search_keys: string[]; owner?: string };

// A model of its own keeps this helper test independent of any domain entity.
const ItemModel =
	(mongoose.models['query_helper_items'] as Model<Item> | undefined) ??
	mongoose.model<Item>(
		'query_helper_items',
		new Schema<Item>({ label: String, rank: Number, search_keys: [String], owner: String }),
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

	describe('with extra conditions', () => {
		const seed = () =>
			ItemModel.insertMany([
				{ label: 'a', rank: 1, owner: 'alice', search_keys: ['a'] },
				{ label: 'b', rank: 2, owner: 'bob', search_keys: ['b'] },
				{ label: 'ab', rank: 3, owner: 'alice', search_keys: ['ab'] },
			]);

		it('keeps only the documents that match them', async () => {
			await seed();

			expect(await labelsOf({ sort: { label: 1 } }, { filter: { owner: 'alice' } })).toEqual(['a', 'ab']);
		});

		it('combines them with the search', async () => {
			await seed();

			expect(
				await labelsOf({ sort: { label: 1 }, search: { search_keys: 'ab' } }, { filter: { owner: 'alice' } }),
			).toEqual(['ab']);
			expect(
				await labelsOf({ sort: { label: 1 }, search: { search_keys: 'b' } }, { filter: { owner: 'alice' } }),
			).toEqual([]);
		});
	});

	describe('with a pagination of its own', () => {
		it('replaces the limit and the page of the query parameters', async () => {
			await ItemModel.insertMany([{ label: 'a' }, { label: 'b' }, { label: 'c' }, { label: 'd' }]);

			expect(
				await labelsOf({ sort: { label: 1 }, limit: 1, page: 1 }, { pagination: { skip: 1, limit: 2 } }),
			).toEqual(['b', 'c']);
		});
	});
});

describe('findOwnedFirst (integration)', () => {
	beforeAll(async () => {
		await ItemModel.init();
	});

	afterEach(async () => {
		await ItemModel.deleteMany({});
	});

	// alice: a1 a2 a3. bob: b1 b2. Without an owner: z1.
	const seed = () =>
		ItemModel.insertMany([
			{ label: 'a1', owner: 'alice', search_keys: ['a1'] },
			{ label: 'b1', owner: 'bob', search_keys: ['b1'] },
			{ label: 'z1', search_keys: ['z1'] },
			{ label: 'a2', owner: 'alice', search_keys: ['a2'] },
			{ label: 'b2', owner: 'bob', search_keys: ['b2'] },
			{ label: 'a3', owner: 'alice', search_keys: ['a3'] },
		]);
	const sort = { label: 1 } as const;
	const labels = async (params: QueryParams, ownerId: string, options?: Parameters<typeof findOwnedFirst<Item>>[4]) =>
		(await findOwnedFirst<Item>(params, ItemModel, ownerId, 'owner', options)).map(({ label }) => label);

	it('puts the documents of the owner first and the rest after, each group in the order of the sort', async () => {
		await seed();

		expect(await labels({ sort }, 'bob')).toEqual(['b1', 'b2', 'a1', 'a2', 'a3', 'z1']);
		expect(await labels({ sort: { label: -1 } }, 'alice')).toEqual(['a3', 'a2', 'a1', 'z1', 'b2', 'b1']);
	});

	it('counts the documents without an owner among the rest', async () => {
		await seed();

		expect(await labels({ sort }, 'nobody')).toEqual(['a1', 'a2', 'a3', 'b1', 'b2', 'z1']);
	});

	it('takes every page from the owner first, then fills and continues with the rest', async () => {
		await seed();
		const page = (number: number) => labels({ sort, limit: 2, page: number }, 'alice');

		expect([await page(1), await page(2), await page(3), await page(4)]).toEqual([
			['a1', 'a2'],
			['a3', 'b1'],
			['b2', 'z1'],
			[],
		]);
	});

	it('does not repeat or skip a document when a page ends exactly where the owner documents end', async () => {
		await seed();
		const page = (number: number) => labels({ sort, limit: 3, page: number }, 'alice');

		expect([await page(1), await page(2)]).toEqual([
			['a1', 'a2', 'a3'],
			['b1', 'b2', 'z1'],
		]);
	});

	it('lists every document once across all the pages', async () => {
		await seed();

		const pages = await Promise.all([1, 2, 3, 4].map((number) => labels({ sort, limit: 2, page: number }, 'bob')));

		expect(pages.flat().sort()).toEqual(['a1', 'a2', 'a3', 'b1', 'b2', 'z1']);
	});

	it('uses the default page size and the first page when none is given', async () => {
		await ItemModel.insertMany(Array.from({ length: 60 }, (_, index) => ({ label: `x${index}`, owner: 'bob' })));

		const first = await labels({ sort: { label: 1 } }, 'alice');

		expect(first).toHaveLength(50);
	});

	it('applies the search to both groups', async () => {
		await seed();

		expect(await labels({ sort, search: { search_keys: 'a' } }, 'bob')).toEqual(['a1', 'a2', 'a3']);
		expect(await labels({ sort, search: { search_keys: 'b' } }, 'alice')).toEqual(['b1', 'b2']);
	});

	it('applies the extra conditions to both groups', async () => {
		await seed();

		expect(await labels({ sort }, 'bob', { filter: { label: { $ne: 'a2' } } })).toEqual([
			'b1',
			'b2',
			'a1',
			'a3',
			'z1',
		]);
	});

	it('sorts both groups by the alphabet of the language when a collation is given', async () => {
		await ItemModel.insertMany([
			{ label: 'Zebra', owner: 'alice' },
			{ label: 'Água', owner: 'alice' },
			{ label: 'Água de coco', owner: 'bob' },
			{ label: 'Cerveja', owner: 'bob' },
		]);

		expect(await labels({ sort }, 'alice', { collation: { locale: 'pt' } })).toEqual([
			'Água',
			'Zebra',
			'Água de coco',
			'Cerveja',
		]);
	});

	it('returns nothing when there are no documents', async () => {
		expect(await labels({ sort }, 'alice')).toEqual([]);
	});

	it('returns nothing for a page past the end', async () => {
		await seed();

		expect(await labels({ sort, limit: 5, page: 3 }, 'alice')).toEqual([]);
	});
});
