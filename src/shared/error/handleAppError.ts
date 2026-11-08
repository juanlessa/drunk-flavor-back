import { LocaleKey } from '../types/locale.types';
import { ErrorResponse } from './error.dtos';
import { AppError, FieldValidationError } from './error.lib';

export const handleAppError = (error: AppError): ErrorResponse => {
	error.log();
	return {
		statusCode: error.status,
		localeKey: error.message as LocaleKey,
		...(error instanceof FieldValidationError && { errors: error.errors }),
	};
};
