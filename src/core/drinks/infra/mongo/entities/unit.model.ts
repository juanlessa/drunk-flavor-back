import { Unit, UnitTranslation } from '@/core/drinks/entities/unit.entity';
import mongoose, { Model, Schema } from 'mongoose';
import { getTranslationsSchema } from '../helpers/translations.helpers';

const UnitTranslationSchema = new Schema<UnitTranslation>(
	{
		name: { type: String, required: true, unique: true },
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

export const UnitModel =
	(mongoose.models['units'] as Model<Unit> | undefined) ?? mongoose.model<Unit>('units', UnitSchema);
