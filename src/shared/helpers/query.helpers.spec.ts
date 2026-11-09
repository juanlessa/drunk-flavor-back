import { describe, expect, it } from 'vitest';
import { sortItemsByFields } from './query.helpers';

type Item = { name: string; rating: number; details: { year: number } };
const items = (): Item[] => [
	{ name: 'Bravo', rating: 4, details: { year: 2020 } },
	{ name: 'Alpha', rating: 5, details: { year: 2018 } },
	{ name: 'Delta', rating: 4, details: { year: 2019 } },
	{ name: 'Charlie', rating: 5, details: { year: 2021 } },
];
const namesOf = (list: Item[]) => list.map(({ name }) => name);

describe('sortItemsByFields', () => {
	it.each(['asc', 'ascending', 1] as const)('sorts ascending with %s', (order) => {
		expect(namesOf(sortItemsByFields(items(), { name: order }))).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);
	});

	it.each(['desc', 'descending', -1] as const)('sorts descending with %s', (order) => {
		expect(namesOf(sortItemsByFields(items(), { name: order }))).toEqual(['Delta', 'Charlie', 'Bravo', 'Alpha']);
	});

	it('sorts by the first field and breaks the ties with the next one', () => {
		expect(namesOf(sortItemsByFields(items(), { rating: 'desc', name: 'asc' }))).toEqual([
			'Alpha',
			'Charlie',
			'Bravo',
			'Delta',
		]);
	});

	it('gives priority to the fields in the order they are listed', () => {
		expect(namesOf(sortItemsByFields(items(), { name: 'asc', rating: 'desc' }))).toEqual([
			'Alpha',
			'Bravo',
			'Charlie',
			'Delta',
		]);
	});

	it('reads a nested field from its path', () => {
		expect(namesOf(sortItemsByFields(items(), { 'details.year': 'asc' }))).toEqual([
			'Alpha',
			'Delta',
			'Bravo',
			'Charlie',
		]);
	});

	it('skips a field with no order', () => {
		expect(namesOf(sortItemsByFields(items(), { rating: undefined, name: 'desc' }))).toEqual([
			'Delta',
			'Charlie',
			'Bravo',
			'Alpha',
		]);
	});
});
