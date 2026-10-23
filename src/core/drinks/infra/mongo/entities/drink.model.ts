import mongoose, { Model, Schema } from 'mongoose';
import { IngredientSchema } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { Drink, DrinkIngredient, DrinkTranslation } from '@/core/drinks/entities/drink.entity';
import { getTranslationsSchema } from '../helpers/translations.helpers';
import { FileMetadata } from '@/shared/types/file.types';

export const FileMetadataSchema = new Schema<FileMetadata>(
	{
		name: { type: String },
		mimetype: { type: String },
		url: { type: String, default: '' },
	},
	{
		_id: false,
	},
);

export const DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'drink_translations_en_name_unique';
export const DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'drink_translations_pt_name_unique';
export const DRINK_UNIQUE_INDEXES = [
	DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

export const DrinkTranslationSchema = new Schema<DrinkTranslation>(
	{
		name: { type: String, required: true },
		method: { type: String, required: true },
	},
	{
		_id: false,
	},
);

export const DrinkIngredientSchema = new Schema<DrinkIngredient>(
	{
		quantity: { type: Number, required: true },
		ingredient: { type: IngredientSchema, excludeIndexes: true, required: true },
	},
	{
		_id: false,
	},
);

export const DrinkSchema = new Schema<Drink>(
	{
		translations: {
			type: getTranslationsSchema(DrinkTranslationSchema),
			required: true,
		},
		cover: { type: FileMetadataSchema, default: undefined },
		thumbnail: { type: FileMetadataSchema, default: undefined },
		ingredients: { type: [DrinkIngredientSchema], required: true },
		avg_rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
		ratings_count: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
			validate: {
				validator: Number.isInteger,
				message: 'Ratings count must be an integer',
			},
		},
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

DrinkSchema.index({ 'translations.en.name': 1 }, { unique: true, name: DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX });
DrinkSchema.index({ 'translations.pt.name': 1 }, { unique: true, name: DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX });

export const DrinkModel =
	(mongoose.models['drinks'] as Model<Drink> | undefined) ?? mongoose.model<Drink>('drinks', DrinkSchema);
