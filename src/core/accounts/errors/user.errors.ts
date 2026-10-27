import { AppErrorOptions } from '@/shared/error/error.dtos';
import { BadRequestError, ConflictError, ForbiddenError } from '@/shared/error/error.lib';

export class UserEmailAlreadyExistsError extends BadRequestError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.alreadyExist', {
			...options,
			cause: options.cause ?? 'A user with this email already exists',
		});
		this.name = 'UserEmailAlreadyExistsError';
	}
}

export class UserOwnerAlreadyExistsError extends ConflictError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.ownerAlreadyExists', {
			...options,
			cause: options.cause ?? 'An owner already exists',
		});
		this.name = 'UserOwnerAlreadyExistsError';
	}
}

export class UserAdministrationForbiddenError extends ForbiddenError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.administrationForbidden', options);
		this.name = 'UserAdministrationForbiddenError';
	}
}

export class UserSelfAdministrationForbiddenError extends ForbiddenError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.selfAdministrationForbidden', options);
		this.name = 'UserSelfAdministrationForbiddenError';
	}
}

export class AdminPeerManagementForbiddenError extends ForbiddenError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.adminPeerManagementForbidden', options);
		this.name = 'AdminPeerManagementForbiddenError';
	}
}

export class OwnerManagementRequiresTransferError extends ForbiddenError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.ownerManagementRequiresTransfer', options);
		this.name = 'OwnerManagementRequiresTransferError';
	}
}

export class UserRoleTransitionInvalidError extends ConflictError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.users.invalidRoleTransition', options);
		this.name = 'UserRoleTransitionInvalidError';
	}
}
