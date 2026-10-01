import mongoose, { Model, Schema } from 'mongoose';
import { Ingredient, IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { CategorySchema } from '@/core/drinks/infra/mongo/entities/category.model';
import { getTranslationsSchema } from '../helpers/translations.helpers';

export const IngredientTranslationSchema = new Schema<IngredientTranslation>(
	{
		name: { type: String, required: true, unique: true },
		unit: { type: String, required: true },
		unit_plural: { type: String, required: true },
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

export const IngredientModel =
	(mongoose.models['ingredients'] as Model<Ingredient> | undefined) ??
	mongoose.model<Ingredient>('ingredients', IngredientSchema);
