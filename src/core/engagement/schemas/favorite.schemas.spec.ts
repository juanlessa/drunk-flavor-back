import { encodeCursor } from '@/shared/helpers/cursor.helpers';
import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import { favoriteQuerySchema } from './favorite.schemas';

describe('favoriteQuerySchema', () => {
	it('decodes the cursor it receives', () => {
		const cursor = { createdAt: new Date('2025-01-01T00:00:00.000Z'), id: new ObjectId().toString() };

		expect(favoriteQuerySchema.parse({ limit: '10', cursor: encodeCursor(cursor) })).toEqual({ limit: 10, cursor });
	});

	it.each([
		['garbage', 'not-a-cursor'],
		['a cursor whose id is not an ObjectId', encodeCursor({ createdAt: new Date(), id: 'abc' })],
	])('rejects %s', (_label, cursor) => {
		const result = favoriteQuerySchema.safeParse({ cursor });

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe('apiResponses.favorites.invalidCursor');
	});
});
