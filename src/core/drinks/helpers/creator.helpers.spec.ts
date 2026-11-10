import { describe, expect, it } from 'vitest';
import { clearCreatorFromRecords, keepCreator, prioritizeCreator } from './creator.helpers';

type Item = { name: string; createdBy?: string; updatedBy?: string };

describe('prioritizeCreator', () => {
	it('moves the records of the user first, keeping the order inside each group', () => {
		const items: Item[] = [
			{ name: '1', createdBy: 'bob' },
			{ name: '2', createdBy: 'alice' },
			{ name: '3', createdBy: 'bob' },
			{ name: '4', createdBy: 'alice' },
		];

		expect(prioritizeCreator(items, 'alice').map(({ name }) => name)).toEqual(['2', '4', '1', '3']);
	});

	it('puts the records without a creator after the ones of the user', () => {
		const items: Item[] = [{ name: '1' }, { name: '2', createdBy: 'alice' }];

		expect(prioritizeCreator(items, 'alice').map(({ name }) => name)).toEqual(['2', '1']);
	});

	it.each([
		['no records', [] as Item[]],
		['no record of the user', [{ name: '1', createdBy: 'bob' }]],
		['only records of the user', [{ name: '1', createdBy: 'alice' }]],
	])('keeps the list as it is with %s to move', (_title, items) => {
		expect(prioritizeCreator(items, 'alice')).toEqual(items);
	});

	it('does not change the list it receives', () => {
		const items: Item[] = [
			{ name: '1', createdBy: 'bob' },
			{ name: '2', createdBy: 'alice' },
		];

		prioritizeCreator(items, 'alice');

		expect(items.map(({ name }) => name)).toEqual(['1', '2']);
	});
});

describe('clearCreatorFromRecords', () => {
	it('removes the user as creator and as last editor, counting each record once', () => {
		const records: Item[] = [
			{ name: '1', createdBy: 'alice', updatedBy: 'alice' },
			{ name: '2', createdBy: 'alice', updatedBy: 'bob' },
			{ name: '3', createdBy: 'bob', updatedBy: 'alice' },
			{ name: '4', createdBy: 'bob', updatedBy: 'bob' },
		];

		const touched = clearCreatorFromRecords(records, 'alice');

		expect(touched).toBe(3);
		expect(records).toEqual([
			{ name: '1' },
			{ name: '2', updatedBy: 'bob' },
			{ name: '3', createdBy: 'bob' },
			{ name: '4', createdBy: 'bob', updatedBy: 'bob' },
		]);
	});

	it('removes the properties instead of leaving them undefined', () => {
		const records: Item[] = [{ name: '1', createdBy: 'alice' }];

		clearCreatorFromRecords(records, 'alice');

		expect(records[0]).not.toHaveProperty('createdBy');
	});

	it('touches nothing when the user wrote nothing', () => {
		const records: Item[] = [{ name: '1', createdBy: 'bob' }];

		expect(clearCreatorFromRecords(records, 'alice')).toBe(0);
		expect(clearCreatorFromRecords([], 'alice')).toBe(0);
	});
});

describe('keepCreator', () => {
	it('puts back the creator the record had, whatever the update says', () => {
		const update: Item = { name: 'new', createdBy: 'mallory' };

		expect(keepCreator(update, { createdBy: 'alice' })).toEqual({ name: 'new', createdBy: 'alice' });
	});

	it('keeps a record without a creator without one', () => {
		const update: Item = { name: 'new', createdBy: 'mallory' };

		const kept = keepCreator(update, {});

		expect(kept).toEqual({ name: 'new' });
		expect(kept).not.toHaveProperty('createdBy');
	});

	it('keeps the rest of the update, including the last editor', () => {
		const update: Item = { name: 'new', updatedBy: 'bob' };

		expect(keepCreator(update, { createdBy: 'alice' })).toEqual({
			name: 'new',
			updatedBy: 'bob',
			createdBy: 'alice',
		});
	});
});
