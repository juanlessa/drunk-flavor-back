import { describe, expect, it } from 'vitest';
import { buildMethod } from '@/core/drinks/modules/preparation';
import { drink, exact, garnishLine, garnishRef, ingredients as i, line, ml } from './testing/preparation.fixtures';

const recipe = drink([line(i.gin, exact(60))], [garnishLine(i.cherry)]);

describe('buildMethod result', () => {
	it('gives no method for a plan with errors, and still lists its warnings', () => {
		const result = buildMethod(recipe, {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [{ type: 'add', target: 'mixing', items: [ml(i.gin)] }],
		});

		expect(result.ok).toBe(false);
		expect(result).not.toHaveProperty('method');
		expect(result.ok ? [] : result.errors.map(({ code }) => code)).toEqual(['nothing_served']);
		expect(result.warnings.map(({ code }) => code)).toEqual(['unused_garnish', 'contents_left_in_mixing_vessel']);
	});

	it('writes the method of a plan with only warnings, and returns the warnings next to it', () => {
		const result = buildMethod(recipe, {
			mixingVessel: 'serving_glass',
			servingGlass: 'rocks',
			actions: [
				{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'garnish', items: [garnishRef(i.cherry)] },
			],
		});

		expect(result.ok).toBe(true);
		expect(result.ok && result.method.en).toBe(
			'In a rocks glass, add gin. Add ice cubes. Add ice cubes. Garnish with cherry.',
		);
		expect(result.warnings).toEqual([{ severity: 'warning', code: 'ice_already_present', actionIndex: 2 }]);
	});

	it('never throws for a plan that makes no sense', () => {
		expect(() => buildMethod(recipe, { mixingVessel: 'shaker', servingGlass: 'coupe', actions: [] })).not.toThrow();
	});
});
