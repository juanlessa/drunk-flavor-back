import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';
import { sortOrderSchema } from './query.schemas';
import { stringifiedJSONSchema } from './stringified.schemas';

const sortSchema = stringifiedJSONSchema(
	z.object({ name: sortOrderSchema, rating: sortOrderSchema, createdAt: sortOrderSchema }).strict(),
);
const querySchema = z.object({ sort: sortSchema.optional() });
const issuesOf = (result: ReturnType<typeof querySchema.safeParse>) =>
	result.success ? [] : result.error.issues.map(({ code, path }) => ({ code, path }));

describe('stringifiedJSONSchema', () => {
	it('parses the JSON and validates it with the given schema', () => {
		expect(sortSchema.parse('{"name":"asc"}')).toEqual({ name: 'asc' });
	});

	it('keeps the keys in the order they were sent, not in the order the schema declares them', () => {
		const parsed = sortSchema.parse('{"createdAt":-1,"rating":"desc","name":"asc"}');

		expect(Object.keys(parsed)).toEqual(['createdAt', 'rating', 'name']);
	});

	it('keeps the values the schema transformed', () => {
		const schema = stringifiedJSONSchema(z.object({ count: z.coerce.number(), label: z.string().trim() }));

		expect(schema.parse('{"label":"  a  ","count":"2"}')).toEqual({ label: 'a', count: 2 });
	});

	it('lists the keys the schema added after the ones that were sent', () => {
		const schema = stringifiedJSONSchema(z.object({ first: z.string().default('x'), second: z.string() }));

		expect(Object.keys(schema.parse('{"second":"y"}'))).toEqual(['second', 'first']);
	});

	it('leaves out the keys the schema strips', () => {
		const schema = stringifiedJSONSchema(z.object({ kept: z.number() }));

		expect(schema.parse('{"unknown":1,"kept":2}')).toEqual({ kept: 2 });
	});

	it.each([
		{ title: 'a list', schema: stringifiedJSONSchema(z.array(z.number())), json: '[3,1,2]', expected: [3, 1, 2] },
		{ title: 'a number', schema: stringifiedJSONSchema(z.number()), json: '42', expected: 42 },
	])('returns $title as it is', ({ schema, json, expected }) => {
		expect(schema.parse(json)).toEqual(expected);
	});

	it('rejects a text that is not JSON', () => {
		expect(issuesOf(querySchema.safeParse({ sort: '{name:asc}' }))).toEqual([{ code: 'custom', path: ['sort'] }]);
	});

	it('points the errors of the schema at the field inside the JSON', () => {
		expect(issuesOf(querySchema.safeParse({ sort: '{"name":"sideways"}' }))).toEqual([
			{ code: 'invalid_union', path: ['sort', 'name'] },
		]);
	});

	it('reports a key the schema does not allow', () => {
		expect(issuesOf(querySchema.safeParse({ sort: '{"price":1}' }))).toEqual([
			{ code: 'unrecognized_keys', path: ['sort'] },
		]);
	});

	it('reports a JSON of the wrong type', () => {
		expect(issuesOf(querySchema.safeParse({ sort: '[1]' }))).toEqual([{ code: 'invalid_type', path: ['sort'] }]);
	});
});
