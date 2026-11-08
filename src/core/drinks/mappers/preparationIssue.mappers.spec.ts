import { describe, expect, it } from 'vitest';
import { toPreparationFieldError } from './preparationIssue.mappers';

describe('toPreparationFieldError', () => {
	it('points at the action of the plan that has the problem', () => {
		expect(toPreparationFieldError({ severity: 'error', code: 'nothing_to_shake', actionIndex: 3 })).toEqual({
			location: 'body',
			path: 'preparation.actions.3',
			localeKey: 'apiResponses.drinks.preparation.nothingToShake',
		});
	});

	it('points at the plan itself when the problem is not about one action', () => {
		expect(toPreparationFieldError({ severity: 'error', code: 'nothing_served' })).toEqual({
			location: 'body',
			path: 'preparation',
			localeKey: 'apiResponses.drinks.preparation.nothingServed',
		});
	});

	it('carries the values behind the problem as params, never as text', () => {
		const error = toPreparationFieldError({
			severity: 'error',
			code: 'unused_required_ingredient',
			params: { ingredientId: 'gin' },
		});

		expect(error.params).toEqual({ ingredientId: 'gin' });
	});

	it('does not add params when there are none', () => {
		expect(
			toPreparationFieldError({ severity: 'warning', code: 'unused_garnish', actionIndex: 0 }),
		).not.toHaveProperty('params');
	});
});
