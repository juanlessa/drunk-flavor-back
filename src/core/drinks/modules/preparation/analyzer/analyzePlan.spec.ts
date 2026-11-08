import { describe, expect, it } from 'vitest';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { PreparationAction } from '@/core/drinks/modules/preparation/entities/preparationAction.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import {
	bare,
	drink,
	exact,
	garnishLine,
	garnishRef,
	ingredients as i,
	line,
	ml,
	units,
} from '@/core/drinks/modules/preparation/testing/preparation.fixtures';
import { IssueCode, IssueParams, IssueSeverity } from '@/core/drinks/modules/preparation/types/issue.types';
import { MixingVessel } from '@/core/drinks/modules/preparation/types/vessel.types';
import { analyzePlan } from './analyzePlan';

// A recipe with one required ingredient, one optional one and one garnish.
const recipe = drink([line(i.gin, exact(60)), line(i.syrup, exact(10), true)], [garnishLine(i.cherry)]);

const plan = (actions: PreparationAction[], mixingVessel: MixingVessel = 'shaker'): PreparationPlan => ({
	mixingVessel,
	servingGlass: 'coupe',
	actions,
});

const addGin: PreparationAction = { type: 'add', target: 'mixing', items: [ml(i.gin)] };
/** Adds the syrup after the drink was strained, so the shaker is left with something in it. */
const addSyrup: PreparationAction = { type: 'add', target: 'mixing', items: [ml(i.syrup)] };
const iceInMixing: PreparationAction = { type: 'add_ice', target: 'mixing', kind: 'cubes' };
const iceInServing: PreparationAction = { type: 'add_ice', target: 'serving', kind: 'cubes' };
const strain: PreparationAction = { type: 'strain', kind: 'single' };
const cherry: PreparationAction = { type: 'garnish', items: [garnishRef(i.cherry)] };

/** A plan that is fine in every way: the baseline the cases below break in one place. */
const validActions: PreparationAction[] = [addGin, iceInMixing, { type: 'shake' }, strain, cherry];

type IssueCase = {
	code: IssueCode;
	severity: IssueSeverity;
	plan: PreparationPlan;
	actionIndex?: number;
	params?: IssueParams;
};

const issueCases: IssueCase[] = [
	{ code: IssueCodes.emptyPlan, severity: 'error', plan: plan([]) },
	{ code: IssueCodes.nothingServed, severity: 'error', plan: plan([addGin]) },
	{
		code: IssueCodes.contentsLeftInMixingVessel,
		severity: 'warning',
		plan: plan([addGin, iceInMixing, { type: 'shake' }, strain, addSyrup]),
		params: { vessel: 'shaker' },
	},
	{
		code: IssueCodes.dryShakeWithoutWetShake,
		severity: 'warning',
		plan: plan([addGin, { type: 'shake' }, strain]),
	},
	{
		code: IssueCodes.invalidItemList,
		severity: 'error',
		plan: plan([{ type: 'add', target: 'mixing', items: [garnishRef(i.cherry)] }]),
		actionIndex: 0,
		params: { list: 'garnishes' },
	},
	{
		code: IssueCodes.unknownItem,
		severity: 'error',
		plan: plan([{ type: 'add', target: 'mixing', items: [ml(i.vodka)] }]),
		actionIndex: 0,
		params: { list: 'ingredients', ingredientId: 'vodka' },
	},
	{
		code: IssueCodes.unknownItem,
		severity: 'error',
		plan: plan([{ type: 'add', target: 'mixing', items: [bare(i.gin)] }]),
		actionIndex: 0,
		params: { list: 'ingredients', ingredientId: 'gin' },
	},
	{
		code: IssueCodes.duplicateItemUse,
		severity: 'error',
		plan: plan([addGin, addGin]),
		actionIndex: 1,
		params: { ingredientId: 'gin' },
	},
	{
		code: IssueCodes.withUnitWithoutUnit,
		severity: 'warning',
		plan: plan([
			addGin,
			iceInMixing,
			{ type: 'shake' },
			strain,
			{ type: 'garnish', items: [garnishRef(i.cherry, undefined, true)] },
		]),
		actionIndex: 4,
		params: { ingredientId: 'cherry' },
	},
	{
		code: IssueCodes.unusedRequiredIngredient,
		severity: 'error',
		plan: plan([{ type: 'add', target: 'mixing', items: [ml(i.syrup)] }, strain]),
		params: { ingredientId: 'gin' },
	},
	{
		code: IssueCodes.unusedGarnish,
		severity: 'warning',
		plan: plan([addGin, iceInMixing, { type: 'shake' }, strain]),
		params: { ingredientId: 'cherry' },
	},
	{
		code: IssueCodes.glassPreparedLate,
		severity: 'warning',
		plan: plan(
			[addGin, iceInMixing, { type: 'shake' }, strain, { type: 'prepare_glass', mode: 'chill' }],
			'shaker',
		),
		actionIndex: 4,
	},
	{
		code: IssueCodes.emptyAdd,
		severity: 'error',
		plan: plan([{ type: 'add', target: 'mixing', items: [] }]),
		actionIndex: 0,
	},
	{
		code: IssueCodes.iceAlreadyPresent,
		severity: 'warning',
		plan: plan([addGin, iceInMixing, iceInMixing]),
		actionIndex: 2,
	},
	{ code: IssueCodes.nothingToMuddle, severity: 'error', plan: plan([{ type: 'muddle' }]), actionIndex: 0 },
	{
		code: IssueCodes.muddleWithIce,
		severity: 'warning',
		plan: plan([addGin, iceInMixing, { type: 'muddle' }]),
		actionIndex: 2,
	},
	{
		code: IssueCodes.shakeRequiresShaker,
		severity: 'error',
		plan: plan([addGin, iceInMixing, { type: 'shake' }], 'mixing_glass'),
		actionIndex: 2,
		params: { vessel: 'mixing_glass' },
	},
	{ code: IssueCodes.nothingToShake, severity: 'error', plan: plan([{ type: 'shake' }]), actionIndex: 0 },
	{
		code: IssueCodes.nothingToStir,
		severity: 'error',
		plan: plan([{ type: 'stir' }], 'mixing_glass'),
		actionIndex: 0,
	},
	{
		code: IssueCodes.stirWithoutIce,
		severity: 'warning',
		plan: plan([addGin, { type: 'stir' }], 'mixing_glass'),
		actionIndex: 1,
	},
	{ code: IssueCodes.nothingToStrain, severity: 'error', plan: plan([strain]), actionIndex: 0 },
	{
		code: IssueCodes.strainWithoutIce,
		severity: 'warning',
		plan: plan([addGin, { type: 'strain', kind: 'single', to: 'mixing' }]),
		actionIndex: 1,
	},
	{
		code: IssueCodes.strainSameVessel,
		severity: 'error',
		plan: plan([addGin, strain], 'serving_glass'),
		actionIndex: 1,
	},
	{
		code: IssueCodes.strainOverIceWithoutIce,
		severity: 'warning',
		plan: plan([addGin, iceInMixing, { type: 'shake' }, { type: 'strain', kind: 'single', overIce: true }]),
		actionIndex: 3,
	},
	{
		code: IssueCodes.icePouredIntoGlass,
		severity: 'warning',
		plan: plan([addGin, iceInMixing, { type: 'shake' }, { type: 'strain', kind: 'none' }]),
		actionIndex: 3,
	},
	{
		code: IssueCodes.topOnEmptyGlass,
		severity: 'warning',
		plan: plan([{ type: 'top', item: ml(i.syrup) }]),
		actionIndex: 0,
	},
	{
		code: IssueCodes.emptyGarnish,
		severity: 'error',
		plan: plan([addGin, iceInMixing, { type: 'shake' }, strain, { type: 'garnish', items: [] }]),
		actionIndex: 4,
	},
	{ code: IssueCodes.garnishOnEmptyGlass, severity: 'warning', plan: plan([cherry]), actionIndex: 0 },
	{
		code: IssueCodes.customTextMissing,
		severity: 'error',
		plan: plan([{ type: 'custom', text: { en: 'Shake it.', pt: '  ' } }]),
		actionIndex: 0,
	},
];

describe('analyzePlan', () => {
	it('finds nothing wrong in a plan that is fine', () => {
		const { issues } = analyzePlan(recipe, plan(validActions));

		expect(issues).toEqual([]);
	});

	it('has a case for every issue code', () => {
		const covered = new Set(issueCases.map(({ code }) => code));

		expect([...covered].sort()).toEqual(Object.values(IssueCodes).sort());
	});

	it.each(issueCases)('reports $code as $severity', ({ code, severity, plan: brokenPlan, actionIndex, params }) => {
		const { issues } = analyzePlan(recipe, brokenPlan);

		expect(issues).toContainEqual({
			severity,
			code,
			...(actionIndex === undefined ? {} : { actionIndex }),
			...(params === undefined ? {} : { params }),
		});
	});

	it('writes one event per action that does something, in order', () => {
		const { events } = analyzePlan(recipe, plan(validActions));

		expect(events.map(({ type }) => type)).toEqual(['add', 'add_ice', 'shake', 'strain', 'garnish']);
	});

	it('treats a shake without ice as a dry shake', () => {
		const { events } = analyzePlan(recipe, plan([addGin, { type: 'shake' }, iceInMixing, { type: 'shake' }]));

		expect(events.filter(({ type }) => type === 'shake')).toEqual([
			expect.objectContaining({ dry: true }),
			expect.objectContaining({ dry: false }),
		]);
	});

	it('counts as used the lines a custom step declares', () => {
		const { issues } = analyzePlan(
			recipe,
			plan([
				{
					type: 'custom',
					text: { en: 'Drop the cherry in.', pt: 'Coloque a cereja.' },
					items: [ml(i.gin), garnishRef(i.cherry)],
					into: 'serving',
				},
			]),
		);

		expect(issues).toEqual([]);
	});

	it('does not ask for an optional ingredient to be used', () => {
		const { issues } = analyzePlan(recipe, plan(validActions));

		expect(issues.map(({ code }) => code)).not.toContain(IssueCodes.unusedRequiredIngredient);
	});

	it('tells the same ingredient apart by the unit it is measured in', () => {
		const twoLines = drink([line(i.mint, exact(8, units.leaf)), line(i.mint, exact(1, units.sprig))]);

		const { issues } = analyzePlan(
			twoLines,
			plan([
				{
					type: 'add',
					target: 'mixing',
					items: [
						{ list: 'ingredients', ingredientId: 'mint', unitId: 'leaf' },
						{ list: 'ingredients', ingredientId: 'mint', unitId: 'sprig' },
					],
				},
				iceInMixing,
				{ type: 'shake' },
				strain,
			]),
		);

		expect(issues).toEqual([]);
	});
});
