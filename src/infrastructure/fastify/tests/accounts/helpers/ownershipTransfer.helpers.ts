import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import { resolveOwnershipTransferInvitationsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';

type Participant = { id: string; sessionVersion?: number };

export const OWNERSHIP_TRANSFER_REASON = 'The current owner is transitioning operational responsibility';
export const OWNERSHIP_TRANSFER_TOKEN = 'ownership-acceptance-token';

const ONE_HOUR_MS = 60 * 60 * 1000;

/** Persists a current invitation directly, so each route's E2E starts from the state it needs. */
export const createOwnershipTransferInvitation = (owner: Participant, target: Participant) =>
	resolveOwnershipTransferInvitationsRepository().create({
		scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
		currentOwnerId: owner.id,
		targetUserId: target.id,
		tokenHash: resolveCryptoProvider().hashToken(OWNERSHIP_TRANSFER_TOKEN),
		reason: OWNERSHIP_TRANSFER_REASON,
		ownerSessionVersion: owner.sessionVersion ?? 1,
		targetSessionVersion: target.sessionVersion ?? 1,
		expiresAt: new Date(Date.now() + ONE_HOUR_MS),
	});
