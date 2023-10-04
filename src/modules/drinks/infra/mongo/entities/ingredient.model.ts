import { IIngredient, IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { Schema, model } from 'mongoose';
import { CategorySchema } from './category.model';
import { getTranslationsSchema } from '../utils/getTranslationsSchema';

export const IngredientTranslationSchema = new Schema<IIngredientTranslation>(
	{
		name: { type: String, required: true, unique: true },
		unit: { type: String, required: true },
		unit_plural: { type: String, required: true }
	},
	{
		_id: false
	}
);

export const IngredientSchema = new Schema<IIngredient>(
	{
		translations: {
			type: getTranslationsSchema(IngredientTranslationSchema),
			required: true
		},
		category: { type: CategorySchema, excludeIndexes: true, required: true },
		is_alcoholic: { type: Boolean, required: true }
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

export const Ingredient = model<IIngredient>('ingredients', IngredientSchema);
