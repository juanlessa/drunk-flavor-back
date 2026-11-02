import { AppErrorOptions } from '@/shared/error/error.dtos';
import { UnauthorizedError } from '@/shared/error/error.lib';

export class SessionRevokedError extends UnauthorizedError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.auth.sessionRevoked', {
			...options,
			cause: options.cause ?? 'The presented session version is no longer current',
		});
		this.name = 'SessionRevokedError';
	}
}
