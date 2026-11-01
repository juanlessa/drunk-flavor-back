import { AppErrorOptions } from '@/shared/error/error.dtos';
import { ConflictError } from '@/shared/error/error.lib';

export class TokenHashAlreadyExistsError extends ConflictError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.auth.tokenAlreadyExist', {
			...options,
			cause: options.cause ?? 'A token with this hash already exists',
		});
		this.name = 'TokenHashAlreadyExistsError';
	}
}

export class TokenUserTypeAlreadyExistsError extends ConflictError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.auth.tokenAlreadyExist', {
			...options,
			cause: options.cause ?? 'A token of this type already exists for this user',
		});
		this.name = 'TokenUserTypeAlreadyExistsError';
	}
}
