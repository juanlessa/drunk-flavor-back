import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { AppErrorOptions } from './error.dtos';

export class AppError extends Error {
	public readonly type: string;
	public readonly status: number;
	public readonly path?: string;

	constructor(message: string, options: AppErrorOptions & { status: number; type: string }) {
		super(message, options);
		this.status = options.status;
		this.type = options.type;
		this.path = options.path;
	}
}

export class ValidationError extends AppError {
	constructor(message: string, options: AppErrorOptions) {
		super(message, { ...options, status: HTTP_STATUS.bad_request, type: 'Bad Request, Failed Validation' });
	}
}

export class BadRequestError extends AppError {
	constructor(message: string, options: AppErrorOptions) {
		super(message, { ...options, status: HTTP_STATUS.bad_request, type: 'Bad Request' });
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string, options: AppErrorOptions) {
		super(message, { ...options, status: HTTP_STATUS.unauthorized, type: 'Unauthorized' });
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string, options: AppErrorOptions) {
		super(message, { ...options, status: HTTP_STATUS.forbidden, type: 'Forbidden' });
	}
}

export class NotFoundError extends AppError {
	constructor(message: string, options: AppErrorOptions) {
		super(message, { ...options, status: HTTP_STATUS.not_found, type: 'Not Found' });
	}
}

export class ServerError extends AppError {
	constructor(message: string, options: AppErrorOptions) {
		super(message, { ...options, status: HTTP_STATUS.internal_server_error, type: 'Server Error' });
	}
}
