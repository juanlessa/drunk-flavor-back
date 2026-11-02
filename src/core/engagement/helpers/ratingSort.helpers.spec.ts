import { normalizeRatingSort } from '@/core/engagement/helpers/ratingSort.helpers';
import { describe, expect, it } from 'vitest';

describe('normalizeRatingSort', () => {
	it('defaults to newest-first with the id tie-breaker when no client sort is present', () => {
		expect(normalizeRatingSort()).toEqual({ createdAt: -1, id: -1 });
	});

	it('converts aliases and always appends id last', () => {
		expect(normalizeRatingSort({ value: 'asc', createdAt: 'descending' })).toEqual({
			value: 1,
			createdAt: -1,
			id: -1,
		});
	});

	it('ignores undefined fields', () => {
		expect(normalizeRatingSort({ value: undefined })).toEqual({ createdAt: -1, id: -1 });
	});
});
