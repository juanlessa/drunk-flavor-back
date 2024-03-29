import { IIngredient, IIngredientTranslation } from '@modules/drinks/entities/ingredient.entity';
import { Schema, model, models } from 'mongoose';
import { CategorySchema } from '@modules/drinks/infra/mongo/entities/category.model';
import { getTranslationsSchema } from '@modules/drinks/infra/mongo/utils/getTranslationsSchema';

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

export const Ingredient = models['ingredients'] || model<IIngredient>('ingredients', IngredientSchema);
