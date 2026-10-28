import mongoose, { Model, Schema, Types } from 'mongoose';
import { Translations } from '@/core/drinks/types/translations';
import { CategoryPersistence, CategorySchema } from './category.model';
import { UnitPersistence, UnitSchema } from './unit.model';
import { getTranslationsSchema } from '../helpers/translations.helpers';

export const INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'ingredient_translations_en_name_unique';
export const INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'ingredient_translations_pt_name_unique';
export const INGREDIENT_UNIQUE_INDEXES = [
	INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

export const IngredientTranslationSchema = new Schema({ name: { type: String, required: true } }, { _id: false });

const ingredientSchemaDefinition = {
	translations: { type: getTranslationsSchema(IngredientTranslationSchema), required: true },
	category: { type: CategorySchema, excludeIndexes: true, required: true },
	unit: { type: UnitSchema, excludeIndexes: true, required: true },
} as const;

export type IngredientPersistence = {
	_id: Types.ObjectId;
	translations: Translations<{ name: string }>;
	category: CategoryPersistence;
	unit: UnitPersistence;
	created_at: Date;
	updated_at: Date;
};

export const IngredientSchema = new Schema<IngredientPersistence>(ingredientSchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

IngredientSchema.index(
	{ 'translations.en.name': 1 },
	{ unique: true, name: INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX },
);
IngredientSchema.index(
	{ 'translations.pt.name': 1 },
	{ unique: true, name: INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX },
);

export const IngredientModel =
	(mongoose.models['ingredients'] as Model<IngredientPersistence> | undefined) ??
	mongoose.model<IngredientPersistence>('ingredients', IngredientSchema);
