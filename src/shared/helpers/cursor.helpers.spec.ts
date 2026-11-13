import { describe, expect, it } from 'vitest';
import { decodeCursor, encodeCursor } from './cursor.helpers';

describe('cursor helpers', () => {
	it('round-trips a cursor', () => {
		const cursor = { createdAt: new Date('2025-01-02T03:04:05.678Z'), id: '66b0000000000000000000a1' };
		expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
	});

	it.each([
		['not base64 json', '%%%'],
		['an empty string', ''],
		['json that is not an object', Buffer.from('42').toString('base64url')],
		['a missing field', Buffer.from(JSON.stringify({ c: 1 })).toString('base64url')],
		['a wrong field type', Buffer.from(JSON.stringify({ c: '1', i: 'a' })).toString('base64url')],
		['an invalid date', Buffer.from(JSON.stringify({ c: 1e20, i: 'a' })).toString('base64url')],
		['an empty id', Buffer.from(JSON.stringify({ c: 1, i: '' })).toString('base64url')],
	])('returns null for %s', (_label, value) => {
		expect(decodeCursor(value)).toBeNull();
	});
});
