import { z } from 'zod/v4';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { requestOwnershipTransferSchema } from './requestOwnershipTransfer.schema';

export type RequestOwnershipTransferReqBody = z.infer<typeof requestOwnershipTransferSchema>;

export type RequestOwnershipTransferCommand = {
	targetUserId: string;
	reason: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
