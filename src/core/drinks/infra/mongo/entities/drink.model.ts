import mongoose, { Model, Schema, Types } from 'mongoose';
import { DrinkIngredientAmountTypes, DrinkIngredientQualifiers } from '@/core/drinks/constants/drink.constants';
import { DrinkIngredientAmount } from '@/core/drinks/entities/drink.entity';
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
export const DRINK_REQUIRED_INGREDIENT_IDS_INDEX = 'drink_required_ingredient_ids';
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

const drinkRecipeItemDefinition = {
	ingredient: { type: IngredientSchema, excludeIndexes: true, required: true },
	amount: { type: DrinkIngredientAmountSchema, required: true },
} as const;

export const DrinkIngredientSchema = new Schema(
	{
		...drinkRecipeItemDefinition,
		optional: { type: Boolean, required: true, default: false },
	},
	{ _id: false },
);

// A garnish is always optional by nature, so it has no `optional` flag.
export const DrinkGarnishSchema = new Schema(drinkRecipeItemDefinition, { _id: false });

const drinkSchemaDefinition = {
	translations: { type: getTranslationsSchema(DrinkTranslationSchema), required: true },
	cover: { type: FileMetadataSchema, default: undefined },
	thumbnail: { type: FileMetadataSchema, default: undefined },
	search_keys: { type: [String], default: undefined, select: false },
	// The ids of the non-optional ingredients, kept apart so a search by the ingredients a person has can use an index.
	// It is written with the recipe (see the repository) and is not part of the drink.
	required_ingredient_ids: { type: [Schema.Types.ObjectId], default: undefined, select: false },
	ingredients: { type: [DrinkIngredientSchema], required: true },
	garnishes: { type: [DrinkGarnishSchema], required: true, default: () => [] },
	// The preparation module validates the plan before it gets here, so it is stored as it is.
	preparation: { type: Schema.Types.Mixed, required: false },
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

export type DrinkGarnishPersistence = {
	ingredient: IngredientPersistence;
	amount: DrinkIngredientAmountPersistence;
};

export type DrinkIngredientPersistence = DrinkGarnishPersistence & {
	optional: boolean;
};

export type DrinkPersistence = {
	_id: Types.ObjectId;
	translations: Translations<{ name: string; method: string }>;
	cover?: FileMetadata;
	thumbnail?: FileMetadata;
	search_keys?: string[];
	required_ingredient_ids?: Types.ObjectId[];
	ingredients: DrinkIngredientPersistence[];
	garnishes: DrinkGarnishPersistence[];
	preparation?: Record<string, unknown>;
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
DrinkSchema.index({ required_ingredient_ids: 1 }, { name: DRINK_REQUIRED_INGREDIENT_IDS_INDEX });

export const DrinkModel =
	(mongoose.models['drinks'] as Model<DrinkPersistence> | undefined) ??
	mongoose.model<DrinkPersistence>('drinks', DrinkSchema);
