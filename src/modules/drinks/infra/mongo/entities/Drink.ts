import { Schema, model } from 'mongoose';
import { IngredientSchema } from './ingredient.model';
import { IDrink, IDrinkIngredient, IDrinkTranslation } from '@modules/drinks/entities/drink.entity';

export const DrinkTranslationSchema = new Schema<IDrinkTranslation>({
	name: { type: String, required: true, unique: true },
	method: { type: String, required: true }
});

export const DrinkIngredientSchema = new Schema<IDrinkIngredient>({
	quantity: { type: Number, required: true },
	ingredient: { type: IngredientSchema, required: true }
});

export const DrinkSchema = new Schema<IDrink>(
	{
		translations: {
			en: { type: DrinkTranslationSchema, required: true },
			pt: { type: DrinkTranslationSchema, required: true }
		},
		cover: { type: String, required: true, default: '' },
		thumbnail: { type: String, required: true, default: '' },
		ingredients: { type: [DrinkIngredientSchema] }
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

export const Drink = model<IDrink>('drinks', DrinkSchema);
