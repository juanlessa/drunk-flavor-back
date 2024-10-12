import { LocaleKey } from '../types/locale.types';

export type AppErrorOptions = ErrorOptions & {
	path?: string;
};

export type ErrorResponse = {
	statusCode: number;
	localeKey: LocaleKey;
};
