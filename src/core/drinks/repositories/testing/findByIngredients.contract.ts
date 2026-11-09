import { ObjectId } from 'mongodb';
import { FACTORY_CREATOR_ID } from '@/core/drinks/factories/authorship.factories';
import { beforeEach, describe, expect, it } from 'vitest';
import { DrinkGarnish, DrinkIngredient } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';

/**
 * What every `IDrinksRepository` must do when it searches drinks by the ingredients a person has. It runs against the
 * in-memory repository, which the use case tests rely on, and against the Mongo one, so both give the same answers.
 *
 * Call it inside the `describe` of the implementation, with a getter for the repository of the current test.
 */
export const describeFindByIngredientsContract = (getRepository: () => IDrinksRepository) => {
	const buildIngredient = (name: string): Ingredient => ({
		id: new ObjectId().toString(),
		translations: { en: { name }, pt: { name } },
		category: {
			id: new ObjectId().toString(),
			translations: { en: { name: 'Category' }, pt: { name: 'Categoria' } },
			isAlcoholic: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		units: [
			{
				id: new ObjectId().toString(),
				translations: {
					en: { name: 'milliliter', namePlural: 'milliliters' },
					pt: { name: 'mililitro', namePlural: 'mililitros' },
				},
				allowDecimal: true,
				kind: 'volume',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		],
		kind: 'generic',
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	const required = (ingredient: Ingredient): DrinkIngredient => createDrinkIngredientFactory(ingredient);
	const optional = (ingredient: Ingredient): DrinkIngredient =>
		createDrinkIngredientFactory(ingredient, { optional: true });
	const garnish = (ingredient: Ingredient): DrinkGarnish => ({ ingredient, amount: { type: 'none' } });
	const createDrink = (name: string, ingredients: DrinkIngredient[], garnishes: DrinkGarnish[] = []) =>
		getRepository().create({
			translations: { en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } },
			ingredients,
			garnishes,
			createdBy: FACTORY_CREATOR_ID,
		});
	const namesOf = (matches: Awaited<ReturnType<IDrinksRepository['findByIngredients']>>) =>
		matches.map(({ drink }) => drink.translations.en.name);
	const ids = (...ingredients: Ingredient[]) => ingredients.map(({ id }) => id);
	const sorted = (values: string[]) => [...values].sort();

	describe('findByIngredients', () => {
		describe('with a small bar', () => {
			const gin = buildIngredient('Gin');
			const lime = buildIngredient('Lime');
			const sugar = buildIngredient('Sugar');
			const bitters = buildIngredient('Bitters');
			const rum = buildIngredient('Rum');
			const pantry = ids(gin, lime);

			beforeEach(async () => {
				await createDrink('Gimlet', [required(gin), required(lime)]);
				await createDrink('Gin sour', [required(gin), required(lime), required(sugar)]);
				await createDrink('Gin fizz', [
					required(gin),
					required(lime),
					required(sugar),
					required(bitters),
					required(rum),
				]);
				await createDrink('Daiquiri', [required(rum), required(lime), required(sugar)]);
				await createDrink('Rum punch', [required(rum), required(sugar)]);
				await createDrink('Plain gin', [required(gin), optional(lime)], [garnish(bitters)]);
			});

			it.each([
				{ maxMissing: 0 as const, expected: ['Gimlet', 'Plain gin'] },
				{ maxMissing: 1 as const, expected: ['Gimlet', 'Plain gin', 'Gin sour'] },
				{ maxMissing: 2 as const, expected: ['Gimlet', 'Plain gin', 'Gin sour', 'Daiquiri'] },
				{ maxMissing: 'any' as const, expected: ['Gimlet', 'Plain gin', 'Gin sour', 'Daiquiri', 'Gin fizz'] },
			])(
				'finds the drinks missing no more than $maxMissing required ingredients',
				async ({ maxMissing, expected }) => {
					const matches = await getRepository().findByIngredients({ ingredientIds: pantry, maxMissing });

					expect(sorted(namesOf(matches))).toEqual(sorted(expected));
				},
			);

			it.each([0, 1, 2, 'any'] as const)(
				'never returns a drink that shares no required ingredient, with maxMissing %s',
				async (maxMissing) => {
					const matches = await getRepository().findByIngredients({ ingredientIds: pantry, maxMissing });

					expect(namesOf(matches)).not.toContain('Rum punch');
				},
			);

			it('does not count the optional ingredients and the garnishes of a drink as ingredients the person has', async () => {
				const byOptional = await getRepository().findByIngredients({
					ingredientIds: ids(lime),
					maxMissing: 'any',
				});
				const byGarnish = await getRepository().findByIngredients({
					ingredientIds: ids(bitters),
					maxMissing: 'any',
				});

				expect(namesOf(byOptional)).not.toContain('Plain gin');
				expect(namesOf(byGarnish)).toEqual(['Gin fizz']);
			});

			it('does not count the optional ingredients and the garnishes of a drink as missing', async () => {
				const matches = await getRepository().findByIngredients({ ingredientIds: ids(gin), maxMissing: 0 });

				expect(namesOf(matches)).toEqual(['Plain gin']);
			});

			it('lists the required ingredients each drink is missing', async () => {
				const matches = await getRepository().findByIngredients({ ingredientIds: pantry, maxMissing: 'any' });
				const missingOf = (name: string) =>
					matches.find(({ drink }) => drink.translations.en.name === name)?.missingIngredientIds;

				expect(missingOf('Gimlet')).toEqual([]);
				expect(missingOf('Plain gin')).toEqual([]);
				expect(missingOf('Gin sour')).toEqual([sugar.id]);
				expect(missingOf('Daiquiri')).toEqual(sorted(ids(rum, sugar)));
				expect(missingOf('Gin fizz')).toEqual(sorted(ids(sugar, bitters, rum)));
			});

			it('puts the most complete drinks first', async () => {
				const matches = await getRepository().findByIngredients({ ingredientIds: pantry, maxMissing: 'any' });

				const missingCounts = matches.map(({ missingIngredientIds }) => missingIngredientIds.length);
				expect(missingCounts).toEqual([...missingCounts].sort((a, b) => a - b));
			});

			it('returns each drink as the other queries do', async () => {
				const [first] = await getRepository().findByIngredients({ ingredientIds: pantry, maxMissing: 0 });

				expect(first?.drink).toEqual(await getRepository().findById(first?.drink.id ?? ''));
			});

			it('pages through the matches without repeating or skipping a drink', async () => {
				const all = await getRepository().findByIngredients({ ingredientIds: pantry, maxMissing: 'any' });

				const pages = await Promise.all(
					[1, 2, 3].map((page) =>
						getRepository().findByIngredients({ ingredientIds: pantry, maxMissing: 'any', limit: 2, page }),
					),
				);
				const beyond = await getRepository().findByIngredients({
					ingredientIds: pantry,
					maxMissing: 'any',
					limit: 2,
					page: 4,
				});

				expect(all).toHaveLength(5);
				expect(pages.map((page) => page.length)).toEqual([2, 2, 1]);
				expect(pages.flat().map(({ drink }) => drink.id)).toEqual(all.map(({ drink }) => drink.id));
				expect(beyond).toEqual([]);
			});

			it('returns nothing when no ingredient is given', async () => {
				await expect(
					getRepository().findByIngredients({ ingredientIds: [], maxMissing: 'any' }),
				).resolves.toEqual([]);
			});

			it('returns nothing when no drink uses the ingredients given', async () => {
				const unknown = ids(buildIngredient('Unknown'));

				await expect(
					getRepository().findByIngredients({ ingredientIds: unknown, maxMissing: 'any' }),
				).resolves.toEqual([]);
			});
		});

		describe('ordering and repeated ingredients', () => {
			const alpha = buildIngredient('Alpha');
			const beta = buildIngredient('Beta');

			it('breaks ties by the best rating and then by the newest drink', async () => {
				await createDrink('Older', [required(alpha)]);
				const rated = await createDrink('Rated', [required(alpha)]);
				await createDrink('Newer', [required(alpha)]);
				await createDrink('Needs beta', [required(alpha), required(beta)]);
				await getRepository().applyRatingDelta({ drinkId: rated.id, countDelta: 1, sumDelta: 5 });

				const matches = await getRepository().findByIngredients({
					ingredientIds: ids(alpha),
					maxMissing: 'any',
				});

				expect(namesOf(matches)).toEqual(['Rated', 'Newer', 'Older', 'Needs beta']);
			});

			it('ranks many good ratings above a single perfect one among drinks missing the same', async () => {
				const single = await createDrink('Single perfect', [required(alpha)]);
				const many = await createDrink('Many good', [required(alpha)]);
				await getRepository().applyRatingDelta({ drinkId: single.id, countDelta: 1, sumDelta: 5 });
				for (let index = 0; index < 10; index += 1) {
					await getRepository().applyRatingDelta({ drinkId: many.id, countDelta: 1, sumDelta: 4 });
				}

				const matches = await getRepository().findByIngredients({ ingredientIds: ids(alpha), maxMissing: 0 });

				expect(namesOf(matches)).toEqual(['Many good', 'Single perfect']);
			});

			it('counts an ingredient that appears twice in a recipe only once', async () => {
				await createDrink('Twice', [required(alpha), required(alpha), required(beta)]);

				const matches = await getRepository().findByIngredients({ ingredientIds: ids(beta), maxMissing: 1 });

				expect(matches.map(({ missingIngredientIds }) => missingIngredientIds)).toEqual([[alpha.id]]);
			});
		});
	});
};
