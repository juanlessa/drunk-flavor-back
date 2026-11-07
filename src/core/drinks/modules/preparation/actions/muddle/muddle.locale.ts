import { words } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { Translations } from '@/core/drinks/types/translations';

export type MuddleSentence = (input: { adverb: string }) => string;

export const muddleSentences: Translations<MuddleSentence> = {
	en: ({ adverb }) => words('Muddle', adverb),
	pt: ({ adverb }) => words('Macere', adverb),
};
