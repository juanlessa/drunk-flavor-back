import { Language, Languages, Translations } from '@/core/drinks/types/translations';

export const LANGUAGES = Object.values(Languages) as Language[];

/** Builds a `Translations` object by computing the value of every language. */
export const buildTranslations = <T>(build: (language: Language) => T): Translations<T> =>
	Object.fromEntries(LANGUAGES.map((language) => [language, build(language)])) as Translations<T>;
