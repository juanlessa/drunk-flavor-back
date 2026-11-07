import { Form } from '@/core/drinks/modules/preparation/locale/types';
import { Translations } from '@/core/drinks/types/translations';

export type PrepareGlassSentences = {
	chill(glass: string): string;
	warm(glass: string): string;
	rinse(glass: (form: Form) => string, item: string): string;
	/** `glass` writes the serving glass in the form the sentence needs; call it once. */
	rim(input: { glass: (form: Form) => string; item: string; half: boolean }): string;
};

export const prepareGlassSentences: Translations<PrepareGlassSentences> = {
	en: {
		chill: (glass) => `Chill ${glass}`,
		warm: (glass) => `Warm ${glass}`,
		rinse: (glass, item) => `Rinse ${glass('the')} with ${item} and discard the excess`,
		rim: ({ glass, item, half }) =>
			half ? `Rim half of ${glass('the')} with ${item}` : `Rim ${glass('the')} with ${item}`,
	},
	pt: {
		chill: (glass) => `Gele ${glass}`,
		warm: (glass) => `Aqueça ${glass}`,
		rinse: (glass, item) => `Passe ${item} ${glass('in')} e descarte o excesso`,
		rim: ({ glass, item, half }) =>
			half ? `Passe ${item} em metade da borda ${glass('of')}` : `Passe ${item} na borda ${glass('of')}`,
	},
};
