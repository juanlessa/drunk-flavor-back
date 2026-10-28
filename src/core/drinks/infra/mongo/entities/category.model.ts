import mongoose, { Model, Schema, Types } from 'mongoose';
import { Translations } from '@/core/drinks/types/translations';
import { getTranslationsSchema } from '../helpers/translations.helpers';

export const CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'category_translations_en_name_unique';
export const CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'category_translations_pt_name_unique';
export const CATEGORY_UNIQUE_INDEXES = [
	CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

const categoryTranslationSchema = new Schema({ name: { type: String, required: true } }, { _id: false });

const categorySchemaDefinition = {
	translations: { type: getTranslationsSchema(categoryTranslationSchema), required: true },
	is_alcoholic: { type: Boolean, required: true },
} as const;

export type CategoryPersistence = {
	_id: Types.ObjectId;
	translations: Translations<{ name: string }>;
	is_alcoholic: boolean;
	created_at: Date;
	updated_at: Date;
};

export const CategorySchema = new Schema<CategoryPersistence>(categorySchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

CategorySchema.index({ 'translations.en.name': 1 }, { unique: true, name: CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX });
CategorySchema.index({ 'translations.pt.name': 1 }, { unique: true, name: CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX });

export const CategoryModel =
	(mongoose.models['categories'] as Model<CategoryPersistence> | undefined) ??
	mongoose.model<CategoryPersistence>('categories', CategorySchema);
