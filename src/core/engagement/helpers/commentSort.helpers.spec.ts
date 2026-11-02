import { normalizeCommentSort } from '@/core/engagement/helpers/commentSort.helpers';
import { describe, expect, it } from 'vitest';

describe('normalizeCommentSort', () => {
	it('defaults to newest-first with the id tie-breaker when no client sort is present', () => {
		expect(normalizeCommentSort()).toEqual({ createdAt: -1, id: -1 });
	});

	it('converts aliases and always appends id last', () => {
		expect(normalizeCommentSort({ updatedAt: 1 })).toEqual({ updatedAt: 1, id: -1 });
	});
});
