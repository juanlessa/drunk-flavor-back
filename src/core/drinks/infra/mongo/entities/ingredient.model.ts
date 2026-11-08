import mongoose, { Model, Schema, Types } from 'mongoose';
import { Translations } from '@/core/drinks/types/translations';
import { Gender } from '@/shared/types/gender.types';
import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { IngredientKind } from '@/core/drinks/entities/ingredient.entity';
import { CategoryPersistence, CategorySchema } from './category.model';
import { UnitPersistence, UnitSchema } from './unit.model';
import { getNameUniqueIndexOptions, getTranslationsSchema } from '../helpers/translations.helpers';

export const INGREDIENT_SEARCH_KEYS_INDEX = 'ingredient_search_keys';
export const INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'ingredient_translations_en_name_unique';
export const INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'ingredient_translations_pt_name_unique';
export const INGREDIENT_UNIQUE_INDEXES = [
	INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

export const IngredientTranslationSchema = new Schema(
	{
		name: { type: String, required: true },
		name_plural: { type: String, required: false },
		description: { type: String, required: false },
		gender: { type: String, required: false },
	},
	{ _id: false },
);

const ingredientSchemaDefinition = {
	translations: { type: getTranslationsSchema(IngredientTranslationSchema), required: true },
	category: { type: CategorySchema, excludeIndexes: true, required: true },
	// Allowed units in display order; empty means not measurable.
	units: { type: [UnitSchema], excludeIndexes: true, required: true, default: () => [] },
	kind: { type: String, enum: Object.values(IngredientKinds), required: true, default: IngredientKinds.generic },
	brand: { type: String, required: false },
	search_keys: { type: [String], default: undefined, select: false },
} as const;

export type IngredientPersistence = {
	_id: Types.ObjectId;
	translations: Translations<{ name: string; name_plural?: string; description?: string; gender?: Gender }>;
	category: CategoryPersistence;
	units: UnitPersistence[];
	kind: IngredientKind;
	brand?: string;
	search_keys?: string[];
	created_at: Date;
	updated_at: Date;
};

export const IngredientSchema = new Schema<IngredientPersistence>(ingredientSchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

IngredientSchema.index(
	{ 'translations.en.name': 1 },
	getNameUniqueIndexOptions('en', INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX),
);
IngredientSchema.index(
	{ 'translations.pt.name': 1 },
	getNameUniqueIndexOptions('pt', INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX),
);
IngredientSchema.index({ search_keys: 1 }, { name: INGREDIENT_SEARCH_KEYS_INDEX });

export const IngredientModel =
	(mongoose.models['ingredients'] as Model<IngredientPersistence> | undefined) ??
	mongoose.model<IngredientPersistence>('ingredients', IngredientSchema);
