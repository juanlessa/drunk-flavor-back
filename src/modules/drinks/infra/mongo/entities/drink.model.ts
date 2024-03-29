import { Schema, model, models } from 'mongoose';
import { IngredientSchema } from '@modules/drinks/infra/mongo/entities/ingredient.model';
import { IDrink, IDrinkIngredient, IDrinkTranslation } from '@modules/drinks/entities/drink.entity';
import { getTranslationsSchema } from '@modules/drinks/infra/mongo/utils/getTranslationsSchema';

export const DrinkTranslationSchema = new Schema<IDrinkTranslation>(
	{
		name: { type: String, required: true, unique: true },
		method: { type: String, required: true }
	},
	{
		_id: false
	}
);

export const DrinkIngredientSchema = new Schema<IDrinkIngredient>(
	{
		quantity: { type: Number, required: true },
		ingredient: { type: IngredientSchema, excludeIndexes: true, required: true }
	},
	{
		_id: false
	}
);

export const DrinkSchema = new Schema<IDrink>(
	{
		translations: {
			type: getTranslationsSchema(DrinkTranslationSchema),
			required: true
		},
		cover: { type: String, default: '' },
		thumbnail: { type: String, default: '' },
		ingredients: { type: [DrinkIngredientSchema], required: true }
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

export const Drink = models['drinks'] || model<IDrink>('drinks', DrinkSchema);
