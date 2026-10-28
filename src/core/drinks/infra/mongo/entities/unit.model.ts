import mongoose, { Model, Schema, Types } from 'mongoose';
import { Translations } from '@/core/drinks/types/translations';
import { UnitKinds } from '@/core/drinks/entities/unit.entity';
import { getTranslationsSchema } from '../helpers/translations.helpers';

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
	},
	{ _id: false },
);

const unitSchemaDefinition = {
	translations: { type: getTranslationsSchema(unitTranslationSchema), required: true },
	symbol: { type: String, required: false },
	space_before_symbol: { type: Boolean, required: false },
	allow_decimal: { type: Boolean, required: true },
	kind: { type: String, enum: Object.values(UnitKinds), required: true },
} as const;

export type UnitPersistence = {
	_id: Types.ObjectId;
	translations: Translations<{ name: string; name_plural: string }>;
	symbol?: string;
	space_before_symbol?: boolean;
	allow_decimal: boolean;
	kind: (typeof UnitKinds)[keyof typeof UnitKinds];
	created_at: Date;
	updated_at: Date;
};

export const UnitSchema = new Schema<UnitPersistence>(unitSchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

UnitSchema.index({ 'translations.en.name': 1 }, { unique: true, name: UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX });
UnitSchema.index({ 'translations.pt.name': 1 }, { unique: true, name: UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX });

export const UnitModel =
	(mongoose.models['units'] as Model<UnitPersistence> | undefined) ??
	mongoose.model<UnitPersistence>('units', UnitSchema);
