import { describe, expect, it } from 'vitest';
import { PreparationDrink, PreparationPlan } from '@/core/drinks/modules/preparation';
import { BadRequestError, FieldValidationError } from '@/shared/error/error.lib';
import { resolveDrinkMethod } from './drinkMethod.helpers';

const ml = {
	id: 'unit-ml',
	kind: 'volume',
	translations: {
		en: { name: 'milliliter', namePlural: 'milliliters' },
		pt: { name: 'mililitro', namePlural: 'mililitros', gender: 'masculine' },
	},
} as const;
const gin = {
	id: 'gin',
	kind: 'generic',
	translations: { en: { name: 'Gin' }, pt: { name: 'Gin', gender: 'masculine' } },
} as const;

const recipe: PreparationDrink = {
	ingredients: [{ ingredient: gin, amount: { type: 'exact', quantity: 60, unit: ml }, optional: false }],
	garnishes: [],
};

const plan: PreparationPlan = {
	mixingVessel: 'serving_glass',
	servingGlass: 'rocks',
	actions: [
		{ type: 'add', target: 'mixing', items: [{ list: 'ingredients', ingredientId: 'gin', unitId: 'unit-ml' }] },
	],
};

const path = 'test';

describe('resolveDrinkMethod', () => {
	it('writes the method of every language from the plan and keeps the plan', () => {
		const result = resolveDrinkMethod(
			{ translations: { en: { name: 'Gin drink' }, pt: { name: 'Drink de gin' } }, preparation: plan },
			recipe,
			path,
		);

		expect(result.translations).toEqual({
			en: { name: 'Gin drink', method: 'In a rocks glass, add gin.' },
			pt: { name: 'Drink de gin', method: 'Em um copo baixo, adicione o gin.' },
		});
		expect(result.preparation).toBe(plan);
	});

	it('keeps the methods written by hand when there is no plan', () => {
		const translations = {
			en: { name: 'Gin drink', method: 'Pour it.' },
			pt: { name: 'Drink de gin', method: 'Despeje.' },
		};

		const result = resolveDrinkMethod({ translations }, recipe, path);

		expect(result.translations).toEqual(translations);
		expect(result.preparation).toBeUndefined();
	});

	it('reports the problems of a plan that does not fit the recipe, pointing at the action', () => {
		const unfit: PreparationPlan = { ...plan, actions: [{ type: 'prepare_glass', mode: 'chill' }] };

		let thrown: unknown;
		try {
			resolveDrinkMethod(
				{ translations: { en: { name: 'Gin drink' }, pt: { name: 'Drink de gin' } }, preparation: unfit },
				recipe,
				path,
			);
		} catch (error) {
			thrown = error;
		}

		expect(thrown).toBeInstanceOf(FieldValidationError);
		expect((thrown as FieldValidationError).errors).toEqual([
			expect.objectContaining({
				location: 'body',
				path: 'preparation',
				localeKey: 'apiResponses.drinks.preparation.unusedRequiredIngredient',
			}),
			expect.objectContaining({
				path: 'preparation',
				localeKey: 'apiResponses.drinks.preparation.nothingServed',
			}),
		]);
	});

	it('refuses to store a drink without a method when the plan is missing too', () => {
		expect(() =>
			resolveDrinkMethod(
				{ translations: { en: { name: 'Gin drink' }, pt: { name: 'Drink de gin' } } },
				recipe,
				path,
			),
		).toThrow(BadRequestError);
	});
});
