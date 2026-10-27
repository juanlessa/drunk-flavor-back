import { AppErrorOptions } from '@/shared/error/error.dtos';
import { BadRequestError } from '@/shared/error/error.lib';

export class IdentityProviderSubjectAlreadyExistsError extends BadRequestError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.alreadyExist', {
			...options,
			cause: options.cause ?? 'An identity with this provider subject already exists',
		});
		this.name = 'IdentityProviderSubjectAlreadyExistsError';
	}
}

export class IdentityUserProviderAlreadyExistsError extends BadRequestError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.alreadyExist', {
			...options,
			cause: options.cause ?? 'The user already has an identity for this provider',
		});
		this.name = 'IdentityUserProviderAlreadyExistsError';
	}
}
