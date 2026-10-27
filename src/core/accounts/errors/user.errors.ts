import { AppErrorOptions } from '@/shared/error/error.dtos';
import { BadRequestError } from '@/shared/error/error.lib';

export class UserEmailAlreadyExistsError extends BadRequestError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.alreadyExist', {
			...options,
			cause: options.cause ?? 'A user with this email already exists',
		});
		this.name = 'UserEmailAlreadyExistsError';
	}
}
