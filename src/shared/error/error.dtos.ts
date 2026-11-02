import { LocaleKey } from '../types/locale.types';

export type AppErrorOptions = ErrorOptions & {
	path?: string;
};

export type FieldErrorParams = Readonly<Partial<Record<'min' | 'max', number>>>;

export type FieldError = {
	/** Request part that failed validation. */
	location: 'body' | 'querystring' | 'params' | 'headers';
	/** Dot-separated path of the invalid field inside `location`; empty when the whole part is invalid. */
	path: string;
	localeKey: LocaleKey;
	/** Rule limits (`min`, `max`) interpolated into the message, so clients never parse the text for them. */
	params?: FieldErrorParams;
};

export type ErrorResponse = {
	statusCode: number;
	localeKey: LocaleKey;
	errors?: FieldError[];
};
