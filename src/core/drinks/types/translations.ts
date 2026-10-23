export const Languages = {
	en: 'en',
	pt: 'pt',
} as const;

export type Language = (typeof Languages)[keyof typeof Languages];

export type Translations<T> = {
	[value in Language]: T;
};

export type TranslationName = {
	name: string;
};

export type TranslationAnyWithNameKey = {
	[key: string]: any;
	name: string;
};
