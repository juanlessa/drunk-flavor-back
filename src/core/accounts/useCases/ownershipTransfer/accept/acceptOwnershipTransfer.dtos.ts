import { z } from 'zod/v4';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { acceptOwnershipTransferSchema } from './acceptOwnershipTransfer.schema';

export type AcceptOwnershipTransferReqBody = z.infer<typeof acceptOwnershipTransferSchema>;

export type AcceptOwnershipTransfer = {
	token: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
