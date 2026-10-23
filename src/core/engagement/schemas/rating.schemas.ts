import { normalizeRatingSort } from '@/core/engagement/helpers/ratingSort.helpers';
import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { limitSchema, pageSchema, sortOrderSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

export const ratingIdValidation = getObjectIdSchema({
	required: 'apiResponses.ratings.requiredId',
	invalid: 'apiResponses.ratings.invalidIdFormat',
});

export const ratingDrinkIdValidation = getObjectIdSchema({
	required: 'apiResponses.ratings.requiredDrinkId',
	invalid: 'apiResponses.ratings.invalidDrinkIdFormat',
});

export const ratingValueValidation = z
	.number({ error: 'apiResponses.ratings.requiredValue' satisfies LocaleKey })
	.int({ error: 'apiResponses.ratings.invalidValue' satisfies LocaleKey })
	.min(1, { error: 'apiResponses.ratings.invalidValue' satisfies LocaleKey })
	.max(5, { error: 'apiResponses.ratings.invalidValue' satisfies LocaleKey });

const ratingSortSchema = z
	.object({
		created_at: sortOrderSchema,
		updated_at: sortOrderSchema,
		value: sortOrderSchema,
	})
	.strict();

export const ratingQuerySchema = z
	.object({
		page: pageSchema.default(DEFAULT_QUERY_PARAMS.page),
		limit: limitSchema.default(DEFAULT_QUERY_PARAMS.limit),
		sort: stringifiedJSONSchema(ratingSortSchema).optional(),
	})
	.strict()
	.transform(({ page, limit, sort }) => ({
		page,
		limit,
		sort: normalizeRatingSort(sort),
	}));
