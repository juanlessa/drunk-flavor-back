import { z, ZodIssueCode } from 'zod';

/**
 * Creates a schema to parse and validate a stringified JSON.
 *
 * @param schema - The Zod schema to validate the parsed JSON.
 * @returns A Zod schema that validates the stringified JSON.
 */
export const stringifiedJSONSchema = <Schema extends z.ZodType>(schema: Schema) =>
	z
		.string()
		.transform((val, ctx) => {
			try {
				return JSON.parse(val);
			} catch (e) {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					message: 'Invalid JSON string',
					path: ctx.path,
				});
				return z.NEVER;
			}
		})
		.pipe(schema);
