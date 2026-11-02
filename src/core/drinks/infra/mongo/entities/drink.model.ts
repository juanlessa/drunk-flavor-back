import mongoose, { Model, Schema, Types } from 'mongoose';
import { Translations } from '@/core/drinks/types/translations';
import { IngredientPersistence, IngredientSchema } from './ingredient.model';
import { getTranslationsSchema } from '../helpers/translations.helpers';
import { FileMetadata } from '@/shared/types/file.types';

export const FileMetadataSchema = new Schema<FileMetadata>(
	{
		name: { type: String },
		mimetype: { type: String },
		url: { type: String, default: '' },
	},
	{ _id: false },
);

export const DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'drink_translations_en_name_unique';
export const DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'drink_translations_pt_name_unique';
export const DRINK_UNIQUE_INDEXES = [
	DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

export const DrinkTranslationSchema = new Schema(
	{
		name: { type: String, required: true },
		method: { type: String, required: true },
	},
	{ _id: false },
);

export const DrinkIngredientSchema = new Schema(
	{
		quantity: { type: Number, required: true },
		ingredient: { type: IngredientSchema, excludeIndexes: true, required: true },
	},
	{ _id: false },
);

const drinkSchemaDefinition = {
	translations: { type: getTranslationsSchema(DrinkTranslationSchema), required: true },
	cover: { type: FileMetadataSchema, default: undefined },
	thumbnail: { type: FileMetadataSchema, default: undefined },
	ingredients: { type: [DrinkIngredientSchema], required: true },
	avg_rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
	ratings_count: {
		type: Number,
		required: true,
		default: 0,
		min: 0,
		validate: { validator: Number.isInteger, message: 'Ratings count must be an integer' },
	},
	ratings_sum: {
		type: Number,
		required: true,
		default: 0,
		min: 0,
		select: false,
		validate: { validator: Number.isInteger, message: 'Ratings sum must be an integer' },
	},
} as const;

export type DrinkPersistence = {
	_id: Types.ObjectId;
	translations: Translations<{ name: string; method: string }>;
	cover?: FileMetadata;
	thumbnail?: FileMetadata;
	ingredients: { quantity: number; ingredient: IngredientPersistence }[];
	avg_rating: number;
	ratings_count: number;
	ratings_sum: number;
	created_at: Date;
	updated_at: Date;
};

export const DrinkSchema = new Schema<DrinkPersistence>(drinkSchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

DrinkSchema.index({ 'translations.en.name': 1 }, { unique: true, name: DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX });
DrinkSchema.index({ 'translations.pt.name': 1 }, { unique: true, name: DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX });

export const DrinkModel =
	(mongoose.models['drinks'] as Model<DrinkPersistence> | undefined) ??
	mongoose.model<DrinkPersistence>('drinks', DrinkSchema);
