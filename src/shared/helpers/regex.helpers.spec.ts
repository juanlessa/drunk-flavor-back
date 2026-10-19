import { describe, expect, it } from 'vitest';
import { escapeRegExp } from '@/shared/helpers/regex.helpers';
import { filterItemsBySearchCriteria } from '@/shared/helpers/query.helpers';

describe('escapeRegExp', () => {
	it('should escape every regex metacharacter', () => {
		const metacharacters = '.*+?^${}()|[]\\';
		const escaped = escapeRegExp(metacharacters);

		expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
	});

	it('should treat an escaped term as a literal pattern', () => {
		const regex = new RegExp(escapeRegExp('a.b'), 'i');

		expect(regex.test('a.b')).toBe(true);
		expect(regex.test('axb')).toBe(false);
	});
});

describe('filterItemsBySearchCriteria with regex metacharacters', () => {
	const items = [{ name: 'apple' }, { name: 'banana' }, { name: 'a.b' }];

	it('should match a metacharacter term literally instead of as a wildcard', () => {
		const result = filterItemsBySearchCriteria(items, { name: '.*' });

		expect(result).toEqual([]);
	});

	it('should match a literal dot term only where the dot exists', () => {
		const result = filterItemsBySearchCriteria(items, { name: 'a.b' });

		expect(result).toEqual([{ name: 'a.b' }]);
	});
});
