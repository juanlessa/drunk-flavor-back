import mongoose, { Model, Schema } from 'mongoose';
import { Category, CategoryTranslation } from '@/core/drinks/entities/category.entity';
import { getTranslationsSchema } from '../helpers/translations.helpers';

export const CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'category_translations_en_name_unique';
export const CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'category_translations_pt_name_unique';
export const CATEGORY_UNIQUE_INDEXES = [
	CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

const CategoryTranslationSchema = new Schema<CategoryTranslation>(
	{
		name: { type: String, required: true },
	},
	{
		_id: false,
	},
);

export const CategorySchema = new Schema<Category>(
	{
		translations: {
			type: getTranslationsSchema(CategoryTranslationSchema),
			required: true,
		},
		is_alcoholic: { type: Boolean, required: true },
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

CategorySchema.index({ 'translations.en.name': 1 }, { unique: true, name: CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX });
CategorySchema.index({ 'translations.pt.name': 1 }, { unique: true, name: CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX });

export const CategoryModel =
	(mongoose.models['categories'] as Model<Category> | undefined) ??
	mongoose.model<Category>('categories', CategorySchema);
