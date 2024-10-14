import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { LocaleKey } from '@/shared/types/locale.types';

type ObjectIdSchemaMessages = {
	required: LocaleKey;
	invalid: LocaleKey;
};

/**
 * Creates a Zod schema to validate MongoDB ObjectId strings with custom error messages.
 *
 * @param messages - Object containing custom error messages for validation.
 * @param messages.required - Message shown when the field is required but missing.
 * @param messages.invalid - Message shown when the field is not a valid ObjectId.
 *
 * @returns A Zod string schema that validates ObjectId strings.
 */
export const getObjectIdSchema = ({ required, invalid }: ObjectIdSchemaMessages) => {
	return z.string({ required_error: required }).refine((val) => ObjectId.isValid(val), {
		message: invalid,
	});
};
