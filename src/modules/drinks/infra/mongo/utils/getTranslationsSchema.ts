import { LANGUAGES, ITranslations } from '@modules/drinks/types/translations';
import { Schema } from 'mongoose';

type ITranslationSchema = {
	type: Schema;
	required: boolean;
};

export const getTranslationsSchema = (schema: Schema) => {
	const languages = Object.values(LANGUAGES);

	const translationsSchema: ITranslations<ITranslationSchema> = languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: { type: schema, required: true } }),
		{} as ITranslations<ITranslationSchema>
	);

	return new Schema(
		{
			...translationsSchema
		},
		{
			_id: false
		}
	);
};
