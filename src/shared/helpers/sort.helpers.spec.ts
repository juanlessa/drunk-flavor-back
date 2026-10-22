import { normalizeSortOrder } from '@/shared/helpers/sort.helpers';
import { describe, expect, it } from 'vitest';

describe('normalizeSortOrder', () => {
	it('maps ascending aliases to 1', () => {
		expect(normalizeSortOrder(1)).toBe(1);
		expect(normalizeSortOrder('asc')).toBe(1);
		expect(normalizeSortOrder('ascending')).toBe(1);
	});

	it('maps every other value to -1', () => {
		expect(normalizeSortOrder(-1)).toBe(-1);
		expect(normalizeSortOrder('desc')).toBe(-1);
		expect(normalizeSortOrder('descending')).toBe(-1);
	});
});
