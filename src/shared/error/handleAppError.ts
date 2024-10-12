import { LocaleKey } from '../types/locale.types';
import { ErrorResponse } from './error.dtos';
import { AppError } from './error.lib';

export const handleAppError = (error: AppError): ErrorResponse => {
	error.log();
	return { statusCode: error.status, localeKey: error.message as LocaleKey };
};
