import { Translations } from '@/core/drinks/types/translations';

/** `items` is the already written list of ingredients ("a vodka, o suco de limão e o xarope"). */
export type AddSentence = (items: string) => string;

export const addSentences: Translations<AddSentence> = {
	en: (items) => `Add ${items}`,
	pt: (items) => `Adicione ${items}`,
};
