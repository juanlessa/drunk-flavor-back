import { LocaleKey } from '../types/locale.types';

export type AppErrorOptions = ErrorOptions & {
	path?: string;
};

/**
 * Values a message may interpolate or a client may read: rule limits (`min`, `max`) from request validation, or
 * ids and enum values from domain checks. Never free text.
 */
export type FieldErrorParams = Readonly<Record<string, string | number>>;

export type FieldError = {
	/** Request part that failed validation. */
	location: 'body' | 'querystring' | 'params' | 'headers';
	/** Dot-separated path of the invalid field inside `location`; empty when the whole part is invalid. */
	path: string;
	localeKey: LocaleKey;
	/** Values behind the message, so clients never parse the text for them. */
	params?: FieldErrorParams;
};

export type ErrorResponse = {
	statusCode: number;
	localeKey: LocaleKey;
	errors?: FieldError[];
};
