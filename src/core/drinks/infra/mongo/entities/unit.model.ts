import { Unit, UnitTranslation } from '@/core/drinks/entities/unit.entity';
import mongoose, { Model, Schema } from 'mongoose';
import { getTranslationsSchema } from '../helpers/translations.helpers';

export const UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX = 'unit_translations_en_name_unique';
export const UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX = 'unit_translations_pt_name_unique';
export const UNIT_UNIQUE_INDEXES = [
	UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
] as const;

const UnitTranslationSchema = new Schema<UnitTranslation>(
	{
		name: { type: String, required: true },
		name_plural: { type: String, required: true },
	},
	{ _id: false },
);

export const UnitSchema = new Schema<Unit>(
	{
		translations: { type: getTranslationsSchema(UnitTranslationSchema), required: true },
		symbol: { type: String, required: false },
		space_before_symbol: { type: Boolean, required: false },
		allow_decimal: { type: Boolean, required: true },
		kind: { type: String, enum: ['volume', 'mass', 'count', 'informal'], required: true },
	},
	{
		toJSON: {
			transform: (_, ret) => {
				Reflect.deleteProperty(ret, '__v');
			},
		},
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	},
);

UnitSchema.index({ 'translations.en.name': 1 }, { unique: true, name: UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX });
UnitSchema.index({ 'translations.pt.name': 1 }, { unique: true, name: UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX });

export const UnitModel =
	(mongoose.models['units'] as Model<Unit> | undefined) ?? mongoose.model<Unit>('units', UnitSchema);
