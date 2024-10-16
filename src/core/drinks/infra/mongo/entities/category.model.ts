import mongoose, { Schema } from 'mongoose';
import { Category, CategoryTranslation } from '@/core/drinks/entities/category.entity';
import { getTranslationsSchema } from '../helpers/translations.helpers';

const CategoryTranslationSchema = new Schema<CategoryTranslation>(
	{
		name: { type: String, required: true, unique: true },
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
	},
	{
		toJSON: {
			transform: (_, ret) => {
				delete ret.__v;
			},
		},
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

export const CategoryModel = mongoose.models['categories'] || mongoose.model<Category>('categories', CategorySchema);
