import { createIngredientSchema } from '@/core/drinks/useCases/ingredients/create/createIngredient.schema';
import { updateIngredientSchema } from '@/core/drinks/useCases/ingredients/update/updateIngredient.schema';
import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

const id = () => new ObjectId().toString();

const names = { en: { name: 'Gabriela' }, pt: { name: 'Gabriela' } };

const create = (extra: object = {}) =>
	createIngredientSchema.safeParse({ translations: names, categoryId: id(), unitIds: [id()], ...extra });

const update = (extra: object = {}) =>
	updateIngredientSchema.safeParse({
		id: id(),
		translations: names,
		categoryId: id(),
		unitIds: [id()],
		...extra,
	});

const withDescription = (en: unknown, pt: unknown = 'Descrição') => ({
	translations: { en: { name: 'Lime', description: en }, pt: { name: 'Limão', description: pt } },
});

const issuesOf = (result: ReturnType<typeof create>) =>
	result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message }));

describe('Ingredient schemas', () => {
	describe('description', () => {
		it('is optional and trimmed', () => {
			const withoutIt = create();
			const trimmed = create(withDescription('  Orange liqueur  '));

			expect(withoutIt.success && withoutIt.data.translations.en).not.toHaveProperty('description');
			expect(trimmed.success && trimmed.data.translations.en.description).toBe('Orange liqueur');
		});

		it('accepts up to 120 characters', () => {
			expect(create(withDescription('a'.repeat(120))).success).toBe(true);
		});

		it.each([
			{ title: 'more than 120 characters', value: 'a'.repeat(121) },
			{ title: 'a blank text', value: '   ' },
			{ title: 'an empty text', value: '' },
			{ title: 'a value that is not text', value: 10 },
		])('rejects $title', ({ value }) => {
			expect(issuesOf(create(withDescription(value)))).toEqual([
				{
					path: ['translations', 'en', 'description'],
					message: 'apiResponses.ingredients.invalidDescriptionFormat',
				},
			]);
		});

		it('can be removed on update with null, and is kept when omitted', () => {
			const removed = update({
				translations: { en: { name: 'Lime', description: null }, pt: { name: 'Limão' } },
			});

			expect(removed.success && removed.data.translations.en.description).toBeNull();
			expect(removed.success && removed.data.translations.pt).not.toHaveProperty('description');
		});

		it('does not accept null on create', () => {
			expect(create(withDescription(null)).success).toBe(false);
		});
	});

	describe('units', () => {
		it('accepts an empty list, which means the ingredient is not measurable', () => {
			expect(create({ unitIds: [] }).success).toBe(true);
			expect(update({ unitIds: [] }).success).toBe(true);
		});

		it('keeps the order of the units', () => {
			const [first, second] = [id(), id()];
			const result = create({ unitIds: [second, first] });

			expect(result.success && result.data.unitIds).toEqual([second, first]);
		});

		it('rejects the same unit listed twice', () => {
			const unitId = id();

			expect(issuesOf(create({ unitIds: [unitId, unitId] }))).toEqual([
				{ path: ['unitIds'], message: 'apiResponses.ingredients.duplicateUnit' },
			]);
		});

		it('rejects an id that is not an object id and a missing list', () => {
			expect(create({ unitIds: ['not-an-id'] }).success).toBe(false);
			expect(create({ unitIds: undefined }).success).toBe(false);
			expect(update({ unitIds: undefined }).success).toBe(false);
		});
	});

	describe('kind and brand on create', () => {
		it('defaults the kind to generic', () => {
			const result = create();

			expect(result.success && result.data.kind).toBe('generic');
		});

		it('keeps the casing of the brand and trims it', () => {
			const result = create({ kind: 'branded', brand: '  Licor 43  ' });

			expect(result.success && result.data.brand).toBe('Licor 43');
		});

		it.each([
			{
				title: 'a branded ingredient has no brand',
				extra: { kind: 'branded' },
				message: 'apiResponses.ingredients.requiredBrand',
			},
			{
				title: 'a generic ingredient has a brand',
				extra: { kind: 'generic', brand: 'Bols' },
				message: 'apiResponses.ingredients.brandNotAllowed',
			},
			{
				title: 'a brand comes without a kind, which defaults to generic',
				extra: { brand: 'Bols' },
				message: 'apiResponses.ingredients.brandNotAllowed',
			},
		])('rejects when $title', ({ extra, message }) => {
			expect(issuesOf(create(extra))).toEqual([{ path: ['brand'], message }]);
		});

		it('rejects an unknown kind and a brand longer than 60 characters', () => {
			expect(issuesOf(create({ kind: 'premium' }))).toEqual([
				{ path: ['kind'], message: 'apiResponses.ingredients.invalidKindFormat' },
			]);
			expect(create({ kind: 'branded', brand: 'a'.repeat(61) }).success).toBe(false);
			expect(create({ kind: 'branded', brand: '   ' }).success).toBe(false);
		});
	});

	describe('kind and brand on update', () => {
		it('enforces the rule when the kind is stated', () => {
			expect(update({ kind: 'branded', brand: 'Licor 43' }).success).toBe(true);
			expect(update({ kind: 'generic' }).success).toBe(true);
			expect(update({ kind: 'generic', brand: null }).success).toBe(true);
			expect(update({ kind: 'branded' }).success).toBe(false);
			expect(update({ kind: 'branded', brand: null }).success).toBe(false);
			expect(update({ kind: 'generic', brand: 'Bols' }).success).toBe(false);
		});

		it('leaves the decision to the domain when the kind is omitted', () => {
			expect(update().success).toBe(true);
			expect(update({ brand: 'Other' }).success).toBe(true);
			expect(update({ brand: null }).success).toBe(true);
		});

		it('still validates the format of the brand when the kind is omitted', () => {
			expect(update({ brand: '' }).success).toBe(false);
			expect(update({ brand: 'a'.repeat(61) }).success).toBe(false);
		});
	});
});
