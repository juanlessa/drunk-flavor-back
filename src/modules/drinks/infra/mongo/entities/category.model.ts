import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { getTranslationsSchema } from '@modules/drinks/infra/mongo/utils/getTranslationsSchema';
import { Schema, model, models } from 'mongoose';

const CategoryTranslationSchema = new Schema<ICategoryTranslation>(
	{
		name: { type: String, required: true, unique: true }
	},
	{
		_id: false
	}
);

export const CategorySchema = new Schema<ICategory>(
	{
		translations: {
			type: getTranslationsSchema(CategoryTranslationSchema),
			required: true
		}
	},
	{
		toJSON: {
			transform: (_, ret) => {
				delete ret.__v;
			}
		},
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		}
	}
);

export const Category = models['categories'] || model<ICategory>('categories', CategorySchema);
