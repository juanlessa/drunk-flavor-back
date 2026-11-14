import { TimeCursor } from '@/shared/types/cursor.types';

/** Encodes a position as an opaque URL-safe string; clients must hand it back as they received it. */
export const encodeCursor = ({ createdAt, id }: TimeCursor): string =>
	Buffer.from(JSON.stringify({ c: createdAt.getTime(), i: id })).toString('base64url');

/** Decodes a string made by `encodeCursor`. Returns `null` when it is not one. */
export const decodeCursor = (value: string): TimeCursor | null => {
	try {
		const parsed: unknown = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
		if (typeof parsed !== 'object' || parsed === null) return null;
		const { c, i } = parsed as { c?: unknown; i?: unknown };
		if (typeof c !== 'number' || typeof i !== 'string' || i.length === 0) return null;
		const createdAt = new Date(c);
		if (Number.isNaN(createdAt.getTime())) return null;
		return { createdAt, id: i };
	} catch {
		return null;
	}
};
