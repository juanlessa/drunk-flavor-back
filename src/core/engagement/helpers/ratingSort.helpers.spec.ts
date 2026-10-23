import { normalizeRatingSort } from '@/core/engagement/helpers/ratingSort.helpers';
import { describe, expect, it } from 'vitest';

describe('normalizeRatingSort', () => {
	it('defaults to newest-first with the _id tie-breaker when no client sort is present', () => {
		expect(normalizeRatingSort()).toEqual({ created_at: -1, _id: -1 });
	});

	it('converts aliases and always appends _id last', () => {
		expect(normalizeRatingSort({ value: 'asc', created_at: 'descending' })).toEqual({
			value: 1,
			created_at: -1,
			_id: -1,
		});
	});

	it('ignores undefined fields', () => {
		expect(normalizeRatingSort({ value: undefined })).toEqual({ created_at: -1, _id: -1 });
	});
});
