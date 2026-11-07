import { Translations } from '@/core/drinks/types/translations';

/** `ice` is the already written kind of ice ("gelo em cubos", "uma pedra grande de gelo"). */
export type AddIceSentence = (ice: string) => string;

export const addIceSentences: Translations<AddIceSentence> = {
	en: (ice) => `Add ${ice}`,
	pt: (ice) => `Adicione ${ice}`,
};
