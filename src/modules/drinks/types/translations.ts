export enum LANGUAGES {
	english = 'en',
	portuguese = 'pt'
}

export type ITranslations<T> = {
	[LANGUAGES.english]: T;
	[LANGUAGES.portuguese]: T;
};

export type ITranslationName = {
	name: string;
};

export type ITranslationsName = {
	[key: string]: any;
	name: string;
};
