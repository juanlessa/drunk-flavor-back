import mongoose, { Model, Schema } from 'mongoose';
import { Ingredient, IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { CategorySchema } from '@/core/drinks/infra/mongo/entities/category.model';
import { UnitSchema } from '@/core/drinks/infra/mongo/entities/unit.model';
import { getTranslationsSchema } from '../helpers/translations.helpers';

export const INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'ingredient_translations_en_name_unique';
export const INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'ingredient_translations_pt_name_unique';
export const INGREDIENT_UNIQUE_INDEXES = [
	INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

export const IngredientTranslationSchema = new Schema<IngredientTranslation>(
	{
		name: { type: String, required: true },
	},
	{
		_id: false,
	},
);

export const IngredientSchema = new Schema<Ingredient>(
	{
		translations: {
			type: getTranslationsSchema(IngredientTranslationSchema),
			required: true,
		},
		category: { type: CategorySchema, excludeIndexes: true, required: true },
		unit: { type: UnitSchema, excludeIndexes: true, required: true },
	},
	{
		toJSON: {
			transform: (_, ret) => {
				Reflect.deleteProperty(ret, '__v');
			},
		},
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

IngredientSchema.index(
	{ 'translations.en.name': 1 },
	{ unique: true, name: INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX },
);
IngredientSchema.index(
	{ 'translations.pt.name': 1 },
	{ unique: true, name: INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX },
);

export const IngredientModel =
	(mongoose.models['ingredients'] as Model<Ingredient> | undefined) ??
	mongoose.model<Ingredient>('ingredients', IngredientSchema);
