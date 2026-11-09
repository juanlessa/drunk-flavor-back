import { z } from 'zod/v4';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Puts the keys of `parsed` in the order they had in `input`. A parsed object lists its keys in the order the schema
 * declares them, not the order the client sent; keys only the schema added (defaults) go last.
 */
const restoreKeyOrder = (input: unknown, parsed: unknown): unknown => {
	if (!isPlainObject(input) || !isPlainObject(parsed)) return parsed;
	const sentKeys = Object.keys(input).filter((key) => key in parsed);
	const addedKeys = Object.keys(parsed).filter((key) => !(key in input));
	return Object.fromEntries([...sentKeys, ...addedKeys].map((key) => [key, parsed[key]]));
};

/**
 * Creates a schema to parse and validate a stringified JSON.
 *
 * The keys of the parsed object keep the order the client sent them in. It matters for a `sort`, where the first
 * key is the main criterion and the next ones break the ties: `{"avgRating":"desc","translations.pt.name":"asc"}`
 * sorts by rating first, whatever order the schema declares the fields in.
 *
 * @param schema - The Zod schema to validate the parsed JSON.
 * @returns A Zod schema that validates the stringified JSON.
 */
export const stringifiedJSONSchema = <Schema extends z.ZodType>(schema: Schema) =>
	z
		.string()
		.transform((val, ctx): unknown => {
			try {
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
		.pipe(
			z.unknown().transform((input, ctx): z.output<Schema> => {
				const result = schema.safeParse(input);
				if (!result.success) {
					// The issues keep their own paths, so the errors read as if the schema had validated the value itself.
					for (const issue of result.error.issues) ctx.issues.push({ ...issue, input: undefined });
					return z.NEVER;
				}
				return restoreKeyOrder(input, result.data) as z.output<Schema>;
			}),
		);
