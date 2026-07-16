import { z } from 'zod/v4';

/**
 * Creates a schema to parse and validate a stringified JSON.
 *
 * @param schema - The Zod schema to validate the parsed JSON.
 * @returns A Zod schema that validates the stringified JSON.
 */
export const stringifiedJSONSchema = <Schema extends z.ZodType>(schema: Schema) =>
	z
		.string()
		.transform((val, ctx): unknown => {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return JSON.parse(val);
			} catch {
				ctx.issues.push({
					code: 'custom',
					input: val,
					error: 'Invalid JSON string',
				});
				return undefined;
			}
		})
		.pipe(schema);
