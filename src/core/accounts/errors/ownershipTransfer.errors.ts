import { AppErrorOptions } from '@/shared/error/error.dtos';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/error/error.lib';

export class OwnershipTransferAlreadyPendingError extends ConflictError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.ownershipTransfer.alreadyPending', options);
		this.name = 'OwnershipTransferAlreadyPendingError';
	}
}

export class OwnershipTransferInvalidError extends BadRequestError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.ownershipTransfer.invalid', options);
		this.name = 'OwnershipTransferInvalidError';
	}
}

export class OwnershipTransferInvitationNotFoundError extends NotFoundError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.ownershipTransfer.notFound', options);
		this.name = 'OwnershipTransferInvitationNotFoundError';
	}
}

export class OwnershipTransferTargetIneligibleError extends ConflictError {
	constructor(options: AppErrorOptions = {}) {
		super('apiResponses.ownershipTransfer.targetIneligible', options);
		this.name = 'OwnershipTransferTargetIneligibleError';
	}
}
