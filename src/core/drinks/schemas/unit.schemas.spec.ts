import { createUnitSchema } from '@/core/drinks/useCases/units/create/createUnit.schema';
import { listUnitsQuerySchema } from '@/core/drinks/useCases/units/list/listUnits.schema';
import { updateUnitSchema } from '@/core/drinks/useCases/units/update/updateUnit.schema';
import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

const validUnit = {
	translations: {
		en: { name: '  MILLILITER  ', namePlural: '  MILLILITERS  ' },
		pt: { name: '  MILILITRO  ', namePlural: '  MILILITROS  ', gender: 'masculine' },
	},
	symbol: '  mL  ',
	spaceBeforeSymbol: false,
	allowDecimal: false,
	kind: 'volume',
};

describe('Unit schemas', () => {
	it.each([createUnitSchema, updateUnitSchema])(
		'normalizes names and symbol without adding optional defaults',
		(schema) => {
			const input = schema === updateUnitSchema ? { id: new ObjectId().toString(), ...validUnit } : validUnit;
			const parsed = schema.parse(input);
			expect(parsed.translations.en).toEqual({ name: 'milliliter', namePlural: 'milliliters' });
			expect(parsed.symbol).toBe('mL');
			expect(parsed.spaceBeforeSymbol).toBe(false);
			expect(parsed.allowDecimal).toBe(false);
		},
	);

	it.each([createUnitSchema, updateUnitSchema])('keeps optional root fields omitted', (schema) => {
		const { symbol: _, spaceBeforeSymbol: __, ...unit } = validUnit;
		const input = schema === updateUnitSchema ? { id: new ObjectId().toString(), ...unit } : unit;
		const parsed = schema.parse(input);
		expect(parsed).not.toHaveProperty('symbol');
		expect(parsed).not.toHaveProperty('spaceBeforeSymbol');
	});

	it.each(['volume', 'mass', 'count', 'informal'])('accepts kind %s', (kind) => {
		expect(createUnitSchema.safeParse({ ...validUnit, kind }).success).toBe(true);
	});

	it.each(['length', '', null, 1, undefined])('rejects invalid kind %s', (kind) => {
		expect(createUnitSchema.safeParse({ ...validUnit, kind }).success).toBe(false);
	});

	it.each([
		{ translations: { ...validUnit.translations, en: { ...validUnit.translations.en, name: ' ' } } },
		{ translations: { ...validUnit.translations, pt: { ...validUnit.translations.pt, namePlural: ' ' } } },
		{ symbol: ' ' },
		{ allowDecimal: undefined },
		{ allowDecimal: 'false' },
		{ spaceBeforeSymbol: 'false' },
	])('rejects invalid payload fields', (override) => {
		expect(createUnitSchema.safeParse({ ...validUnit, ...override }).success).toBe(false);
	});

	it.each([
		['create', createUnitSchema],
		['update', updateUnitSchema],
	] as const)('requires both supported translations for %s', (_, schema) => {
		const baseInput = schema === updateUnitSchema ? { id: new ObjectId().toString(), ...validUnit } : validUnit;
		const { en, pt } = validUnit.translations;
		expect(schema.safeParse({ ...baseInput, translations: { pt } }).success).toBe(false);
		expect(schema.safeParse({ ...baseInput, translations: { en } }).success).toBe(false);
	});

	describe('useIngredientName', () => {
		const countUnit = { ...validUnit, kind: 'count', symbol: undefined };
		const parse = (schema: typeof createUnitSchema | typeof updateUnitSchema, extra: object) =>
			schema.safeParse({
				...(schema === updateUnitSchema ? { id: new ObjectId().toString() } : {}),
				...countUnit,
				...extra,
			});

		it.each([createUnitSchema, updateUnitSchema])('is optional and stays omitted', (schema) => {
			const parsed = parse(schema, {});
			expect(parsed.success && parsed.data).not.toHaveProperty('useIngredientName');
		});

		it.each([createUnitSchema, updateUnitSchema])(
			'keeps true and false on a count unit without a symbol',
			(schema) => {
				for (const useIngredientName of [true, false]) {
					const parsed = parse(schema, { useIngredientName });
					expect(parsed.success && parsed.data.useIngredientName).toBe(useIngredientName);
				}
			},
		);

		it.each([createUnitSchema, updateUnitSchema])('rejects a value that is not a boolean', (schema) => {
			expect(parse(schema, { useIngredientName: 'true' }).success).toBe(false);
			expect(parse(schema, { useIngredientName: null }).success).toBe(false);
		});

		it.each([createUnitSchema, updateUnitSchema])(
			'rejects a kind other than count, pointing at the kind',
			(schema) => {
				const result = parse(schema, { useIngredientName: true, kind: 'volume' });
				expect(
					result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message })),
				).toEqual([{ path: ['kind'], message: 'apiResponses.units.ingredientNameRequiresCountKind' }]);
			},
		);

		it.each([createUnitSchema, updateUnitSchema])('rejects a symbol, pointing at the symbol', (schema) => {
			const result = parse(schema, { useIngredientName: true, symbol: 'u' });
			expect(result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message }))).toEqual([
				{ path: ['symbol'], message: 'apiResponses.units.ingredientNameNotAllowedWithSymbol' },
			]);
		});

		it('does not restrict the units that are not written with the ingredient name', () => {
			expect(createUnitSchema.safeParse({ ...validUnit, useIngredientName: false }).success).toBe(true);
		});

		it('lets an update drop the symbol with null on a unit written with the ingredient name', () => {
			expect(parse(updateUnitSchema, { useIngredientName: true, symbol: null }).success).toBe(true);
		});
	});

	it('parses pagination, translated search, and translated sort', () => {
		const parsed = listUnitsQuerySchema.parse({
			page: '2',
			limit: '5',
			search: JSON.stringify({ 'translations.en.namePlural': 'liters' }),
			sort: JSON.stringify({ 'translations.pt.name': -1 }),
		});
		expect(parsed).toEqual({
			page: 2,
			limit: 5,
			search: { 'translations.en.namePlural': 'liters' },
			sort: { 'translations.pt.name': -1 },
		});
	});
	describe('gender', () => {
		const withGender = (gender: unknown) => ({
			...validUnit,
			translations: { ...validUnit.translations, pt: { ...validUnit.translations.pt, gender } },
		});

		it.each(['masculine', 'feminine'])('accepts the %s gender in portuguese', (gender) => {
			expect(createUnitSchema.safeParse(withGender(gender)).success).toBe(true);
		});

		it('requires the gender in portuguese, but not in english', () => {
			const result = createUnitSchema.safeParse(withGender(undefined));
			expect(!result.success && result.error.issues.map(({ path, message }) => ({ path, message }))).toEqual([
				{ path: ['translations', 'pt', 'gender'], message: 'apiResponses.validation.requiredGender' },
			]);
			expect(createUnitSchema.safeParse(validUnit).success).toBe(true);
		});

		it('rejects a gender that does not exist', () => {
			expect(createUnitSchema.safeParse(withGender('neuter')).success).toBe(false);
		});
	});
});
