import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createDrinkFactory, createDrinkIngredientInputFactory } from '@/core/drinks/factories/drink.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { createCategorySchema } from '@/core/drinks/useCases/categories/create/createCategory.schema';
import { updateCategorySchema } from '@/core/drinks/useCases/categories/update/updateCategory.schema';
import { createDrinkSchema } from '@/core/drinks/useCases/drinks/create/createDrink.schema';
import { updateDrinkSchema } from '@/core/drinks/useCases/drinks/update/updateDrink.schema';
import { createIngredientSchema } from '@/core/drinks/useCases/ingredients/create/createIngredient.schema';
import { updateIngredientSchema } from '@/core/drinks/useCases/ingredients/update/updateIngredient.schema';
import { createUnitSchema } from '@/core/drinks/useCases/units/create/createUnit.schema';
import { updateUnitSchema } from '@/core/drinks/useCases/units/update/updateUnit.schema';

const id = () => new ObjectId().toString();
const { createdBy: _unit, ...unit } = createUnitFactory();
const { createdBy: _category, ...category } = createCategoryFactory();
const ingredient = { ...createIngredientFactory(), categoryId: id(), unitIds: [id()] };
const drink = {
	translations: createDrinkFactory().translations,
	ingredients: [createDrinkIngredientInputFactory(id(), { unitId: id() })],
};

const bodies = [
	['create unit', createUnitSchema, unit],
	['update unit', updateUnitSchema, { ...unit, id: id() }],
	['create category', createCategorySchema, category],
	['update category', updateCategorySchema, { ...category, id: id() }],
	['create ingredient', createIngredientSchema, ingredient],
	['update ingredient', updateIngredientSchema, { ...ingredient, id: id() }],
	['create drink', createDrinkSchema, drink],
	['update drink', updateDrinkSchema, { ...drink, id: id(), garnishes: [] }],
] as const;

describe('Catalog request bodies', () => {
	it.each(bodies)('accept a valid body to %s', (_title, schema, body) => {
		expect(schema.safeParse(body).success).toBe(true);
	});

	// The creator and the last editor come from the signed-in user, so a client must never be able to set them.
	it.each(bodies)('drop the creator and the last editor sent by the client to %s', (_title, schema, body) => {
		const result = schema.safeParse({ ...body, createdBy: 'mallory', updatedBy: 'mallory' });

		expect(result.success).toBe(true);
		expect(result.data).not.toHaveProperty('createdBy');
		expect(result.data).not.toHaveProperty('updatedBy');
	});
});
