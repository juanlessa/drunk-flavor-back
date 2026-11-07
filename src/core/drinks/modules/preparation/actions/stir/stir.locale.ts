import { words } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { Translations } from '@/core/drinks/types/translations';

export type StirSentence = (input: { adverb: string; duration: string }) => string;

export const stirSentences: Translations<StirSentence> = {
	en: ({ adverb, duration }) => words('Stir', adverb, duration),
	pt: ({ adverb, duration }) => words('Mexa', adverb, duration),
};
