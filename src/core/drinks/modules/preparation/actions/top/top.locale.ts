import { Translations } from '@/core/drinks/types/translations';

/** `item` is the already written ingredient ("a água com gás"). */
export type TopSentence = (item: string) => string;

export const topSentences: Translations<TopSentence> = {
	en: (item) => `Top up with ${item}`,
	pt: (item) => `Complete com ${item}`,
};
