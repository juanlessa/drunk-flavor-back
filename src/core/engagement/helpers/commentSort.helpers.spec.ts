import { normalizeCommentSort } from '@/core/engagement/helpers/commentSort.helpers';
import { describe, expect, it } from 'vitest';

describe('normalizeCommentSort', () => {
	it('defaults to newest-first with the _id tie-breaker when no client sort is present', () => {
		expect(normalizeCommentSort()).toEqual({ created_at: -1, _id: -1 });
	});

	it('converts aliases and always appends _id last', () => {
		expect(normalizeCommentSort({ updated_at: 1 })).toEqual({ updated_at: 1, _id: -1 });
	});
});
