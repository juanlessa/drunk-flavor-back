import { LANGUAGES } from '@modules/drinks/types/translations';
import { Schema } from 'mongoose';

export const getTranslationsSchema = (schema: Schema) => {
	return new Schema(
		{
			[LANGUAGES.english]: { type: schema, required: true },
			[LANGUAGES.portuguese]: { type: schema, required: true }
		},
		{
			_id: false
		}
	);
};
