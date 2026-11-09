import { listDrinksSchema } from '@/core/drinks/useCases/drinks/list/listDrinks.schema';
import { describe, expect, it } from 'vitest';

const parseSort = (sort: object) => listDrinksSchema.safeParse({ sort: JSON.stringify(sort) });

describe('List drinks schema', () => {
	describe('sort', () => {
		it.each(['asc', 'desc', 'ascending', 'descending', 1, -1])('accepts the rating with the order %s', (order) => {
			const result = parseSort({ avgRating: order });

			expect(result.success && result.data.sort).toEqual({ avgRating: order });
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
	});
});
