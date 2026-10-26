import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { createUnitSchema } from '@/core/drinks/useCases/units/create/createUnit.schema';
import { listUnitsQuerySchema } from '@/core/drinks/useCases/units/list/listUnits.schema';
import { updateUnitSchema } from '@/core/drinks/useCases/units/update/updateUnit.schema';
import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

const validUnit = createUnitFactory({
	translations: {
		en: { name: '  MILLILITER  ', name_plural: '  MILLILITERS  ' },
		pt: { name: '  MILILITRO  ', name_plural: '  MILILITROS  ' },
	},
	symbol: '  mL  ',
	space_before_symbol: false,
	allow_decimal: false,
	kind: 'volume',
});

describe('Unit schemas', () => {
	it.each([createUnitSchema, updateUnitSchema])(
		'normalizes names and symbol without adding optional defaults',
		(schema) => {
			const input = schema === updateUnitSchema ? { id: new ObjectId().toString(), ...validUnit } : validUnit;
			const parsed = schema.parse(input);
			expect(parsed.translations.en).toEqual({ name: 'milliliter', name_plural: 'milliliters' });
			expect(parsed.symbol).toBe('mL');
			expect(parsed.space_before_symbol).toBe(false);
			expect(parsed.allow_decimal).toBe(false);
		},
	);

	it.each([createUnitSchema, updateUnitSchema])('keeps optional root fields omitted', (schema) => {
		const { symbol: _, space_before_symbol: __, ...unit } = validUnit;
		const input = schema === updateUnitSchema ? { id: new ObjectId().toString(), ...unit } : unit;
		const parsed = schema.parse(input);
		expect(parsed).not.toHaveProperty('symbol');
		expect(parsed).not.toHaveProperty('space_before_symbol');
	});

	it.each(['volume', 'mass', 'count', 'informal'])('accepts kind %s', (kind) => {
		expect(createUnitSchema.safeParse({ ...validUnit, kind }).success).toBe(true);
	});

	it.each(['length', '', null, 1, undefined])('rejects invalid kind %s', (kind) => {
		expect(createUnitSchema.safeParse({ ...validUnit, kind }).success).toBe(false);
	});

	it.each([
		{ translations: { ...validUnit.translations, en: { ...validUnit.translations.en, name: ' ' } } },
		{ translations: { ...validUnit.translations, pt: { ...validUnit.translations.pt, name_plural: ' ' } } },
		{ symbol: ' ' },
		{ allow_decimal: undefined },
		{ allow_decimal: 'false' },
		{ space_before_symbol: 'false' },
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

	it('parses pagination, translated search, and translated sort', () => {
		const parsed = listUnitsQuerySchema.parse({
			page: '2',
			limit: '5',
			search: JSON.stringify({ 'translations.en.name_plural': 'liters' }),
			sort: JSON.stringify({ 'translations.pt.name': -1 }),
		});
		expect(parsed).toEqual({
			page: 2,
			limit: 5,
			search: { 'translations.en.name_plural': 'liters' },
			sort: { 'translations.pt.name': -1 },
		});
	});
});
