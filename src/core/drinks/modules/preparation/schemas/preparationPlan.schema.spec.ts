import { describe, expect, it } from 'vitest';
import { preparationExamples } from '@/core/drinks/modules/preparation/testing/preparation.examples';
import { preparationPlanValidation } from './preparationPlan.schema';

const item = { list: 'ingredients', ingredientId: 'gin', unitId: 'ml' };
const action = (extra: object) => ({ mixingVessel: 'shaker', servingGlass: 'coupe', actions: [extra] });
const prefix = 'apiResponses.drinks.preparation';

/** Where and why the schema rejected the input. */
const issuesOf = (input: unknown) => {
	const result = preparationPlanValidation.safeParse(input);
	return result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message }));
};

describe('preparationPlanValidation', () => {
	it.each(preparationExamples)('accepts the plan of $name', ({ plan }) => {
		expect(preparationPlanValidation.safeParse(plan).success).toBe(true);
	});

	it('keeps the optional fields omitted when they are not sent', () => {
		const parsed = preparationPlanValidation.parse(action({ type: 'shake' }));

		expect(parsed.actions[0]).toEqual({ type: 'shake' });
	});

	it('does not carry fields it does not know', () => {
		const parsed = preparationPlanValidation.parse({ ...action({ type: 'shake', extra: true }), note: 'x' });

		expect(parsed).not.toHaveProperty('note');
		expect(parsed.actions[0]).not.toHaveProperty('extra');
	});

	describe('the plan', () => {
		it.each([
			{ title: 'is missing', input: undefined, path: [], message: `${prefix}.requiredPreparation` },
			{
				title: 'has an unknown mixing vessel',
				input: { ...action({ type: 'shake' }), mixingVessel: 'bucket' },
				path: ['mixingVessel'],
				message: `${prefix}.invalidMixingVessel`,
			},
			{
				title: 'has an unknown serving glass',
				input: { ...action({ type: 'shake' }), servingGlass: 'bucket' },
				path: ['servingGlass'],
				message: `${prefix}.invalidServingGlass`,
			},
			{
				title: 'has no actions',
				input: { mixingVessel: 'shaker', servingGlass: 'coupe', actions: [] },
				path: ['actions'],
				message: `${prefix}.requiredActions`,
			},
			{
				title: 'has actions that are not a list',
				input: { mixingVessel: 'shaker', servingGlass: 'coupe', actions: 'shake' },
				path: ['actions'],
				message: `${prefix}.requiredActions`,
			},
			{
				title: 'has an action of an unknown type',
				input: action({ type: 'blend' }),
				path: ['actions', 0, 'type'],
				message: `${prefix}.invalidActionType`,
			},
		])('rejects a plan that $title', ({ input, path, message }) => {
			expect(issuesOf(input)).toEqual([{ path, message }]);
		});
	});

	describe('the actions', () => {
		it.each([
			{
				title: 'add without items',
				input: { type: 'add', target: 'mixing', items: [] },
				path: ['items'],
				message: 'requiredItems',
			},
			{
				title: 'add with an unknown target',
				input: { type: 'add', target: 'bucket', items: [item] },
				path: ['target'],
				message: 'invalidVesselRole',
			},
			{
				title: 'add_ice with an unknown kind',
				input: { type: 'add_ice', target: 'mixing', kind: 'snow' },
				path: ['kind'],
				message: 'invalidIceKind',
			},
			{
				title: 'muddle with an unknown intensity',
				input: { type: 'muddle', intensity: 'brutal' },
				path: ['intensity'],
				message: 'invalidIntensity',
			},
			{
				title: 'shake for zero seconds',
				input: { type: 'shake', seconds: 0 },
				path: ['seconds'],
				message: 'invalidDuration',
			},
			{
				title: 'shake for a fraction of a second',
				input: { type: 'shake', seconds: 1.5 },
				path: ['seconds'],
				message: 'invalidDuration',
			},
			{
				title: 'shake for seconds written as text',
				input: { type: 'shake', seconds: '10' },
				path: ['seconds'],
				message: 'invalidDuration',
			},
			{
				title: 'stir for negative revolutions',
				input: { type: 'stir', revolutions: -3 },
				path: ['revolutions'],
				message: 'invalidDuration',
			},
			{
				title: 'strain of an unknown kind',
				input: { type: 'strain', kind: 'sieve' },
				path: ['kind'],
				message: 'invalidStrainKind',
			},
			{
				title: 'strain with the destination as text',
				input: { type: 'strain', kind: 'single', to: 'sink' },
				path: ['to'],
				message: 'invalidVesselRole',
			},
			{
				title: 'strain over ice written as text',
				input: { type: 'strain', kind: 'single', overIce: 'yes' },
				path: ['overIce'],
				message: 'invalidFlag',
			},
			{ title: 'top without an item', input: { type: 'top' }, path: ['item'], message: 'invalidItemRef' },
			{
				title: 'garnish without items',
				input: { type: 'garnish', items: [] },
				path: ['items'],
				message: 'requiredItems',
			},
			{
				title: 'garnish of an unknown style',
				input: { type: 'garnish', items: [item], style: 'hang' },
				path: ['style'],
				message: 'invalidGarnishStyle',
			},
			{
				title: 'prepare_glass of an unknown mode',
				input: { type: 'prepare_glass', mode: 'polish' },
				path: ['mode'],
				message: 'invalidGlassPreparationMode',
			},
			{
				title: 'rinse without an item',
				input: { type: 'prepare_glass', mode: 'rinse' },
				path: ['item'],
				message: 'invalidItemRef',
			},
			{
				title: 'rim of an unknown coverage',
				input: { type: 'prepare_glass', mode: 'rim', item, coverage: 'third' },
				path: ['coverage'],
				message: 'invalidRimCoverage',
			},
			{
				title: 'custom without the text of a language',
				input: { type: 'custom', text: { en: 'Do it.' } },
				path: ['text', 'pt'],
				message: 'requiredText',
			},
			{
				title: 'custom with a blank text',
				input: { type: 'custom', text: { en: 'Do it.', pt: '   ' } },
				path: ['text', 'pt'],
				message: 'requiredText',
			},
		])('rejects $title', ({ input, path, message }) => {
			expect(issuesOf(action(input))).toEqual([
				{ path: ['actions', 0, ...path], message: `${prefix}.${message}` },
			]);
		});
	});

	describe('the references to recipe lines', () => {
		it.each([
			{ title: 'a list that does not exist', ref: { ...item, list: 'pantry' }, path: ['list'] },
			{ title: 'no ingredient id', ref: { list: 'ingredients' }, path: ['ingredientId'] },
			{ title: 'a blank ingredient id', ref: { ...item, ingredientId: '  ' }, path: ['ingredientId'] },
			{ title: 'a blank unit id', ref: { ...item, unitId: '' }, path: ['unitId'] },
		])('rejects $title', ({ ref, path }) => {
			expect(issuesOf(action({ type: 'top', item: ref }))).toEqual([
				{ path: ['actions', 0, 'item', ...path], message: `${prefix}.invalidItemRef` },
			]);
		});

		it('rejects withUnit written as text', () => {
			expect(issuesOf(action({ type: 'top', item: { ...item, withUnit: 'yes' } }))).toEqual([
				{ path: ['actions', 0, 'item', 'withUnit'], message: `${prefix}.invalidFlag` },
			]);
		});

		it('accepts a reference without a unit', () => {
			expect(issuesOf(action({ type: 'top', item: { list: 'ingredients', ingredientId: 'gin' } }))).toEqual([]);
		});
	});

	it('leaves the meaning of a well formed plan to the analysis', () => {
		// Straining before anything was added is nonsense, but its format is fine.
		expect(issuesOf(action({ type: 'strain', kind: 'single' }))).toEqual([]);
	});
});
