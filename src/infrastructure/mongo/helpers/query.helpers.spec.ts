import { describe, expect, it } from 'vitest';
import { buildSearchConditions } from './query.helpers';

describe('buildSearchConditions', () => {
	it('returns no conditions without a search', () => {
		expect(buildSearchConditions(undefined)).toEqual({});
		expect(buildSearchConditions({})).toEqual({});
	});

	it('requires every word of a search keys term to be the start of a key', () => {
		const { search_keys } = buildSearchConditions({ search_keys: 'coc ag' });

		expect(search_keys).toEqual({ $all: [/^coc/, /^ag/] });
	});

	it('ignores the stop words of the search keys term', () => {
		expect(buildSearchConditions({ search_keys: 'licor de laranja' })).toEqual({
			search_keys: { $all: [/^licor/, /^laranja/] },
		});
	});

	it('matches other fields as a case insensitive substring, escaping the term', () => {
		const { label } = buildSearchConditions({ label: 'a.b' });

		expect(label).toEqual(/a\.b/i);
		expect((label as RegExp).test('A.B')).toBe(true);
		expect((label as RegExp).test('axb')).toBe(false);
	});

	it('skips a field without a term', () => {
		expect(buildSearchConditions({ label: undefined, other: 'x' })).toEqual({ other: /x/i });
	});
});
