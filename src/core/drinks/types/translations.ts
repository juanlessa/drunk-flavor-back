export enum LanguagesEnum {
	en = 'en',
	pt = 'pt',
}

export type Language = keyof typeof LanguagesEnum;

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
