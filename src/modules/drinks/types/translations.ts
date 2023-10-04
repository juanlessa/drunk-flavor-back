export enum LANGUAGES {
	english = 'en',
	portuguese = 'pt'
}

export type ITranslations<T> = {
	[value in LANGUAGES]: T;
};

export type ITranslationName = {
	name: string;
};

export type ITranslationsName = {
	[key: string]: any;
	name: string;
};
