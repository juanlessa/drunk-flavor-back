import { listDrinksSchema } from '@/core/drinks/useCases/drinks/list/listDrinks.schema';
import { describe, expect, it } from 'vitest';

const parseSort = (sort: object) => listDrinksSchema.safeParse({ sort: JSON.stringify(sort) });

describe('List drinks schema', () => {
	describe('sort', () => {
		it.each(['asc', 'desc', 'ascending', 'descending', 1, -1])('accepts the rating with the order %s', (order) => {
			const result = parseSort({ avgRating: order });

			expect(result.success && result.data.sort).toEqual({ avgRating: order });
		});

		it.each(['desc', 'asc'])('accepts the rating score with the order %s', (order) => {
			const result = parseSort({ ratingScore: order, 'translations.pt.name': 'asc' });

			expect(result.success && result.data.sort).toEqual({ ratingScore: order, 'translations.pt.name': 'asc' });
		});

		it('accepts the rating together with the name of each language', () => {
			const sort = { avgRating: 'desc', 'translations.pt.name': 'asc', 'translations.en.name': 'asc' };

			const result = parseSort(sort);

			expect(result.success && result.data.sort).toEqual(sort);
		});

		it.each([
			{ title: 'the rating first', sort: { avgRating: 'desc', 'translations.pt.name': 'asc' } },
			{ title: 'the name first', sort: { 'translations.pt.name': 'asc', avgRating: 'desc' } },
		])('keeps the order the criteria were sent in, with $title', ({ sort }) => {
			const result = parseSort(sort);

			expect(Object.keys(result.success ? (result.data.sort ?? {}) : {})).toEqual(Object.keys(sort));
		});

		it.each([2, 0, 'up', null])('rejects the rating with the order %s', (order) => {
			const result = parseSort({ avgRating: order });

			expect(result.success ? [] : result.error.issues.map(({ path }) => path)).toEqual([['sort', 'avgRating']]);
		});

		it.each(['createdAt', 'updatedAt'])('accepts %s with either order', (field) => {
			const newest = parseSort({ [field]: 'desc' });
			const oldest = parseSort({ [field]: 'asc' });

			expect(newest.success && newest.data.sort).toEqual({ [field]: 'desc' });
			expect(oldest.success && oldest.data.sort).toEqual({ [field]: 'asc' });
		});

		it('accepts every criterion at once, in the order sent', () => {
			const sort = {
				createdAt: 'desc',
				ratingScore: 'desc',
				avgRating: 'desc',
				updatedAt: 'asc',
				'translations.en.name': 'asc',
			};

			const result = parseSort(sort);

			expect(Object.keys(result.success ? (result.data.sort ?? {}) : {})).toEqual(Object.keys(sort));
		});

		it.each([
			{ title: 'a typo', sort: { avgrating: 'desc' } },
			{ title: 'a field that cannot sort', sort: { 'translations.pt.method': 'asc' } },
			{ title: 'a language that does not exist', sort: { 'translations.es.name': 'asc' } },
			{ title: 'an unknown key next to a valid one', sort: { createdAt: 'desc', price: 'asc' } },
		])('rejects $title instead of ignoring it', ({ sort }) => {
			const result = parseSort(sort);

			expect(result.success ? [] : result.error.issues.map(({ code, path }) => ({ code, path }))).toEqual([
				{ code: 'unrecognized_keys', path: ['sort'] },
			]);
		});

		it('accepts an empty sort, which leaves the list unsorted', () => {
			const result = parseSort({});

			expect(result.success && result.data.sort).toEqual({});
		});
	});
});
