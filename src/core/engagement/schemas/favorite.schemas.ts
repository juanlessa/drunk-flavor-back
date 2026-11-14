import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { decodeCursor } from '@/shared/helpers/cursor.helpers';
import { limitSchema } from '@/shared/schemas/query.schemas';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export const favoriteDrinkIdValidation = getObjectIdSchema({
	required: 'apiResponses.favorites.requiredDrinkId',
	invalid: 'apiResponses.favorites.invalidDrinkIdFormat',
});

/** Turns the opaque cursor a client hands back into its position, rejecting anything this API did not issue. */
export const favoriteCursorValidation = z.string().transform((value, ctx) => {
	const cursor = decodeCursor(value);
	if (!cursor || !OBJECT_ID_PATTERN.test(cursor.id)) {
		ctx.addIssue({ code: 'custom', message: 'apiResponses.favorites.invalidCursor' satisfies LocaleKey });
		return z.NEVER;
	}
	return cursor;
});

export const favoriteQuerySchema = z
	.object({
		limit: limitSchema.default(DEFAULT_QUERY_PARAMS.limit),
		cursor: favoriteCursorValidation.optional(),
	})
	.strict();
