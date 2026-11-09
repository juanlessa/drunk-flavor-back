import mongoose, { Model, Schema, Types } from 'mongoose';
import { Translations } from '@/core/drinks/types/translations';
import { Gender } from '@/shared/types/gender.types';
import { UnitKinds } from '@/core/drinks/constants/unit.constants';
import { getNameUniqueIndexOptions, getTranslationsSchema } from '../helpers/translations.helpers';

export const UNIT_SEARCH_KEYS_INDEX = 'unit_search_keys';
export const UNIT_CREATED_BY_INDEX = 'unit_created_by';
export const UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'unit_translations_en_name_unique';
export const UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'unit_translations_pt_name_unique';
export const UNIT_UNIQUE_INDEXES = [
	UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

const unitTranslationSchema = new Schema(
	{
		name: { type: String, required: true },
		name_plural: { type: String, required: true },
		gender: { type: String, required: false },
	},
	{ _id: false },
);

const unitSchemaDefinition = {
	translations: { type: getTranslationsSchema(unitTranslationSchema), required: true },
	symbol: { type: String, required: false },
	space_before_symbol: { type: Boolean, required: false },
	allow_decimal: { type: Boolean, required: true },
	kind: { type: String, enum: Object.values(UnitKinds), required: true },
	use_ingredient_name: { type: Boolean, required: false },
	search_keys: { type: [String], default: undefined, select: false },
	// Who created the record (set once, never changed) and who changed it last. Both are removed when that account is closed.
	created_by: { type: String, required: false, immutable: true },
	updated_by: { type: String, required: false },
} as const;

export type UnitPersistence = {
	_id: Types.ObjectId;
	translations: Translations<{ name: string; name_plural: string; gender?: Gender }>;
	symbol?: string;
	space_before_symbol?: boolean;
	allow_decimal: boolean;
	kind: (typeof UnitKinds)[keyof typeof UnitKinds];
	use_ingredient_name?: boolean;
	search_keys?: string[];
	created_by?: string;
	updated_by?: string;
	created_at: Date;
	updated_at: Date;
};

export const UnitSchema = new Schema<UnitPersistence>(unitSchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

UnitSchema.index(
	{ 'translations.en.name': 1 },
	getNameUniqueIndexOptions('en', UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX),
);
UnitSchema.index(
	{ 'translations.pt.name': 1 },
	getNameUniqueIndexOptions('pt', UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX),
);
UnitSchema.index({ search_keys: 1 }, { name: UNIT_SEARCH_KEYS_INDEX });
UnitSchema.index({ created_by: 1 }, { name: UNIT_CREATED_BY_INDEX });

export const UnitModel =
	(mongoose.models['units'] as Model<UnitPersistence> | undefined) ??
	mongoose.model<UnitPersistence>('units', UnitSchema);
