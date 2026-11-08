import { words } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { Translations } from '@/core/drinks/types/translations';

export type ShakeSentence = (input: { adverb: string; dry: boolean; duration: string }) => string;

export const shakeSentences: Translations<ShakeSentence> = {
	en: ({ adverb, dry, duration }) => words(dry ? 'Dry shake' : 'Shake', adverb, dry && '(without ice)', duration),
	pt: ({ adverb, dry, duration }) => words('Agite', adverb, dry && 'sem gelo (dry shake)', duration),
};
