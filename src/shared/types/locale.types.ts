import en from '@/shared/locales/en.json';

/** Dot-separated paths to every string leaf of a nested catalog, for example `apiResponses.auth.sessionRevoked`. */
type LeafPaths<T, Prefix extends string = ''> = {
	[K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : LeafPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** The catalog is nested JSON; its dotted paths are the keys used across the API and in responses. */
export type LocaleKey = LeafPaths<typeof en>;
