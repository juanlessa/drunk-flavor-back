/** Catalog as authored in the locale JSON files: arbitrarily nested objects with string leaves. */
export type NestedMessages = { readonly [key: string]: string | NestedMessages };

/** Catalog after flattening: dotted path to message. */
export type FlatMessages = Readonly<Record<string, string>>;

export type TranslateParams = Readonly<Record<string, string | number>>;

export type I18nOptions = {
	catalogs: Readonly<Record<string, NestedMessages>>;
	defaultLocale: string;
};

export type I18nPluginOptions = {
	defaultLocale: string;
	/** Locales the server can answer in. Order is irrelevant for negotiation; it only needs to include the default. */
	supportedLocales: readonly string[];
};

export type I18n = {
	readonly defaultLocale: string;
	/** Supported locales, with the default locale first. */
	readonly supportedLocales: readonly string[];
	/** Whether the default catalog defines the key. */
	has: (key: string) => boolean;
	/**
	 * Pure, stateless translation. Keys are dotted paths into the nested catalog.
	 * Resolution order: requested locale, default locale, the key itself. Placeholders use the `{name}` syntax.
	 */
	translate: (locale: string, key: string, params?: TranslateParams) => string;
};
