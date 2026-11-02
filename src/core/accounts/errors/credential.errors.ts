import { AppErrorOptions } from '@/shared/error/error.dtos';
import { ConflictError } from '@/shared/error/error.lib';

export class CredentialAlreadyExistsError extends ConflictError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.profile.passwordAlreadyConfigured', {
			...options,
			cause: options.cause ?? 'A credential already exists for this user',
		});
		this.name = 'CredentialAlreadyExistsError';
	}
}
