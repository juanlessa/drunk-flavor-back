import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { AppErrorOptions } from './error.dtos';
import { logger } from '@/shared/logger';
import { LocaleKey } from '../types/locale.types';

export class AppError extends Error {
	public type: string;
	public status: number;
	public path?: string;

	constructor(message: LocaleKey, options: AppErrorOptions & { status: number; type: string }) {
		super(message, options);
		this.status = options.status;
		this.type = options.type;
		this.path = options.path;
	}

	public log(): void {
		logger.error(`%s: %s. \n`, this.path || this.name, this.message);
		if (this.cause) {
			logger.error(this.cause);
		}
		logger.error(this);
	}
}

export class ValidationError extends AppError {
	constructor(message: LocaleKey, options: AppErrorOptions) {
		super(message, {
			...options,
			status: HTTP_STATUS.bad_request,
			type: 'Bad Request, Failed Validation.',
		});
	}
}

export class BadRequestError extends AppError {
	constructor(message: LocaleKey, options: AppErrorOptions) {
		super(message, {
			...options,
			status: HTTP_STATUS.bad_request,
			type: 'Bad Request.',
		});
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: LocaleKey, options: AppErrorOptions) {
		super(message, {
			...options,
			status: HTTP_STATUS.unauthorized,
			type: 'Unauthorized.',
		});
	}
}

export class ForbiddenError extends AppError {
	constructor(message: LocaleKey, options: AppErrorOptions) {
		super(message, {
			...options,
			status: HTTP_STATUS.forbidden,
			type: 'Forbidden.',
		});
	}
}

export class NotFoundError extends AppError {
	constructor(message: LocaleKey, options: AppErrorOptions) {
		super(message, {
			...options,
			status: HTTP_STATUS.not_found,
			type: 'Not Found.',
		});
	}
}

export class ServerError extends AppError {
	constructor(message: LocaleKey, options: AppErrorOptions) {
		super(message, {
			...options,
			status: HTTP_STATUS.internal_server_error,
			type: 'Server Error.',
		});
	}
}
