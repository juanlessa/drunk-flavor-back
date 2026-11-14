import { describe, expect, it } from 'vitest';
import {
	buildSearchKeys,
	getSearchRank,
	matchesSearchTerm,
	normalizeSearchText,
	tokenizeSearchTerm,
	tokenizeSearchText,
} from './search.helpers';

describe('normalizeSearchText', () => {
	it.each([
		{ value: 'Curaçau Água', expected: 'curacau agua' },
		{ value: '  LIMÃO  ', expected: 'limao' },
		{ value: 'Añejo', expected: 'anejo' },
		{ value: 'rosé', expected: 'rose' },
		{ value: 'Triple Sec', expected: 'triple sec' },
	])('normalizes "$value" to "$expected"', ({ value, expected }) => {
		expect(normalizeSearchText(value)).toBe(expected);
	});

	it('treats accented and plain spellings as the same text', () => {
		expect(normalizeSearchText('Limão')).toBe(normalizeSearchText('LIMAO'));
	});
});

describe('tokenizeSearchText', () => {
	it('splits words and treats punctuation as a separator', () => {
		expect(tokenizeSearchText('Triple-Sec (Licor)')).toEqual(['triple', 'sec', 'licor']);
	});

	it('keeps digits as part of a token', () => {
		expect(tokenizeSearchText('Licor 43')).toEqual(['licor', '43']);
	});

	it('keeps a text without letters or digits as a single token so it stays searchable', () => {
		expect(tokenizeSearchText('%')).toEqual(['%']);
	});

	it.each(['', '   '])('returns no tokens for a blank text "%s"', (value) => {
		expect(tokenizeSearchText(value)).toEqual([]);
	});
});

describe('tokenizeSearchTerm', () => {
	it('drops stop words in Portuguese and English', () => {
		expect(tokenizeSearchTerm('Licor de laranja')).toEqual(['licor', 'laranja']);
		expect(tokenizeSearchTerm('liqueur of orange')).toEqual(['liqueur', 'orange']);
	});

	it('keeps the stop words when the term has nothing else, so the search still narrows', () => {
		expect(tokenizeSearchTerm('de')).toEqual(['de']);
		expect(tokenizeSearchTerm('the of')).toEqual(['the', 'of']);
	});

	it('returns no tokens for a blank term', () => {
		expect(tokenizeSearchTerm('  ')).toEqual([]);
	});
});

describe('getSearchRank', () => {
	const tiers = [['licor', 'gin'], ['laranja'], ['destilado']];

	it.each([
		{ term: 'lic', expected: 1 },
		{ term: 'lara', expected: 2 },
		{ term: 'dest', expected: 3 },
		{ term: 'licor lar', expected: 2 },
		{ term: 'lar destilado licor', expected: 3 },
		{ term: 'licor de gin', expected: 1 },
	])('ranks "$term" as tier $expected (the worst of its words)', ({ term, expected }) => {
		expect(getSearchRank(tiers, term)).toBe(expected);
	});

	it('is null when a word is in no tier', () => {
		expect(getSearchRank(tiers, 'licor xyz')).toBeNull();
	});

	it('is the best rank for a term without searchable words', () => {
		expect(getSearchRank(tiers, '   ')).toBe(1);
	});
});

describe('buildSearchKeys', () => {
	it('builds normalized, deduplicated tokens from every value', () => {
		expect(buildSearchKeys(['Blue Curaçao', 'Curaçau Azul'])).toEqual(['blue', 'curacao', 'curacau', 'azul']);
		expect(buildSearchKeys(['Lime', 'lime juice'])).toEqual(['lime', 'juice']);
	});

	it('ignores undefined, null and blank values', () => {
		expect(buildSearchKeys([undefined, null, '', '  ', 'Rum'])).toEqual(['rum']);
	});

	it('keeps stop words by default', () => {
		expect(buildSearchKeys(['Água de coco'])).toEqual(['agua', 'de', 'coco']);
	});

	it('leaves stop words out when asked to', () => {
		expect(buildSearchKeys(['Licor de laranja e casca'], { ignoreStopWords: true })).toEqual([
			'licor',
			'laranja',
			'casca',
		]);
	});
});

describe('matchesSearchTerm', () => {
	const keys = ['triple', 'sec', 'licor', 'laranja'];

	it.each([
		{ term: 'tri', expected: true },
		{ term: 'tri s', expected: true },
		{ term: 'sec triple', expected: true },
		{ term: 'LARANJA', expected: true },
		{ term: 'rang', expected: false },
		{ term: 'tri xyz', expected: false },
	])('returns $expected for the term "$term"', ({ term, expected }) => {
		expect(matchesSearchTerm(keys, term)).toBe(expected);
	});

	it('ignores accents and stop words in the term', () => {
		expect(matchesSearchTerm(['licor', 'laranja'], 'licór de laranjá')).toBe(true);
	});

	it('requires a stop-word-only term to match a key', () => {
		expect(matchesSearchTerm(['agua', 'de', 'coco'], 'de')).toBe(true);
		expect(matchesSearchTerm(['licor', 'laranja'], 'de')).toBe(false);
	});

	it('matches everything when the term has no searchable words', () => {
		expect(matchesSearchTerm(keys, '   ')).toBe(true);
	});
});
