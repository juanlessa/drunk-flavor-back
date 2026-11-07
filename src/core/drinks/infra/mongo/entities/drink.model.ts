import mongoose, { Model, Schema, Types } from 'mongoose';
import {
	DrinkIngredientAmountTypes,
	DrinkIngredientQualifiers,
	DrinkIngredientRoles,
} from '@/core/drinks/constants/drink.constants';
import { DrinkIngredientAmount, DrinkIngredientRole } from '@/core/drinks/entities/drink.entity';
import { Translations } from '@/core/drinks/types/translations';
import { IngredientPersistence, IngredientSchema } from './ingredient.model';
import { UnitPersistence, UnitSchema } from './unit.model';
import { getNameUniqueIndexOptions, getTranslationsSchema } from '../helpers/translations.helpers';
import { FileMetadata } from '@/shared/types/file.types';

export const FileMetadataSchema = new Schema<FileMetadata>(
	{
		name: { type: String },
		mimetype: { type: String },
		url: { type: String, default: '' },
	},
	{ _id: false },
);

export const DRINK_SEARCH_KEYS_INDEX = 'drink_search_keys';
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

export const DrinkIngredientAmountSchema = new Schema(
	{
		type: {
			type: String,
			enum: Object.values(DrinkIngredientAmountTypes),
			required: true,
		},
		quantity: { type: Number, required: false },
		qualifier: { type: String, enum: Object.values(DrinkIngredientQualifiers), required: false },
		// Snapshot of one of the ingredient's units; absent for `none` and optional for `qualitative`.
		unit: { type: UnitSchema, excludeIndexes: true, required: false },
	},
	{ _id: false },
);

export const DrinkIngredientSchema = new Schema(
	{
		ingredient: { type: IngredientSchema, excludeIndexes: true, required: true },
		role: {
			type: String,
			enum: Object.values(DrinkIngredientRoles),
			required: true,
			default: DrinkIngredientRoles.ingredient,
		},
		amount: { type: DrinkIngredientAmountSchema, required: true },
		optional: { type: Boolean, required: true, default: false },
	},
	{ _id: false },
);

const drinkSchemaDefinition = {
	translations: { type: getTranslationsSchema(DrinkTranslationSchema), required: true },
	cover: { type: FileMetadataSchema, default: undefined },
	thumbnail: { type: FileMetadataSchema, default: undefined },
	search_keys: { type: [String], default: undefined, select: false },
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

export type DrinkIngredientAmountPersistence = {
	type: DrinkIngredientAmount['type'];
	quantity?: number;
	qualifier?: (typeof DrinkIngredientQualifiers)[keyof typeof DrinkIngredientQualifiers];
	unit?: UnitPersistence;
};

export type DrinkIngredientPersistence = {
	ingredient: IngredientPersistence;
	role: DrinkIngredientRole;
	amount: DrinkIngredientAmountPersistence;
	optional: boolean;
};

export type DrinkPersistence = {
	_id: Types.ObjectId;
	translations: Translations<{ name: string; method: string }>;
	cover?: FileMetadata;
	thumbnail?: FileMetadata;
	search_keys?: string[];
	ingredients: DrinkIngredientPersistence[];
	avg_rating: number;
	ratings_count: number;
	ratings_sum: number;
	created_at: Date;
	updated_at: Date;
};

export const DrinkSchema = new Schema<DrinkPersistence>(drinkSchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

DrinkSchema.index(
	{ 'translations.en.name': 1 },
	getNameUniqueIndexOptions('en', DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX),
);
DrinkSchema.index(
	{ 'translations.pt.name': 1 },
	getNameUniqueIndexOptions('pt', DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX),
);
DrinkSchema.index({ search_keys: 1 }, { name: DRINK_SEARCH_KEYS_INDEX });

export const DrinkModel =
	(mongoose.models['drinks'] as Model<DrinkPersistence> | undefined) ??
	mongoose.model<DrinkPersistence>('drinks', DrinkSchema);
