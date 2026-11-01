import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { acceptOwnershipTransferController } from '@/core/accounts/useCases/ownershipTransfer/accept/acceptOwnershipTransfer.controller';
import { acceptOwnershipTransferSchema } from '@/core/accounts/useCases/ownershipTransfer/accept/acceptOwnershipTransfer.schema';
import { cancelOwnershipTransferController } from '@/core/accounts/useCases/ownershipTransfer/cancel/cancelOwnershipTransfer.controller';
import { getPendingOwnershipTransferController } from '@/core/accounts/useCases/ownershipTransfer/getPending/getPendingOwnershipTransfer.controller';
import { requestOwnershipTransferController } from '@/core/accounts/useCases/ownershipTransfer/request/requestOwnershipTransfer.controller';
import { requestOwnershipTransferSchema } from '@/core/accounts/useCases/ownershipTransfer/request/requestOwnershipTransfer.schema';
import { resendOwnershipTransferController } from '@/core/accounts/useCases/ownershipTransfer/resend/resendOwnershipTransfer.controller';
import { pluginGenerator } from '../../helpers/fastify.helpers';
import { enforceCompleteProfile } from '../../middlewares/enforceCompleteProfile';
import { requireRecentAuthentication } from '../../middlewares/requireRecentAuthentication';
import { verifyAndRenewToken } from '../../middlewares/verifyAndRenewToken';
import { verifyPermissions } from '../../middlewares/verifyPermissions';
import { Routes } from '../../types/fastify.types';

const ONE_MINUTE = 60_000;
const BAN_THRESHOLD = 10;
const sensitiveRouteConfig = { rateLimit: { max: 5, timeWindow: ONE_MINUTE, ban: BAN_THRESHOLD } } as const;

const ownerPreValidation = [
	verifyAndRenewToken,
	enforceCompleteProfile,
	requireRecentAuthentication,
	verifyPermissions('transferOwnership', 'User'),
];

const acceptancePreValidation = [verifyAndRenewToken, enforceCompleteProfile, requireRecentAuthentication];

// Read-only: no recent authentication or sensitive rate limit, but the same owner-only permission as the commands.
const ownerReadPreValidation = [
	verifyAndRenewToken,
	enforceCompleteProfile,
	verifyPermissions('transferOwnership', 'User'),
];

const routes: Routes = (server) => {
	server.get(
		'/administration/ownership-transfer',
		{ schema: { tags: ['Administration'] }, preValidation: ownerReadPreValidation },
		getPendingOwnershipTransferController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/administration/ownership-transfer',
		{
			config: sensitiveRouteConfig,
			schema: { tags: ['Administration'], body: requestOwnershipTransferSchema },
			preValidation: ownerPreValidation,
		},
		requestOwnershipTransferController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/administration/ownership-transfer/accept',
		{
			config: sensitiveRouteConfig,
			schema: { tags: ['Administration'], body: acceptOwnershipTransferSchema },
			preValidation: acceptancePreValidation,
		},
		acceptOwnershipTransferController,
	);

	server.post(
		'/administration/ownership-transfer/resend',
		{ config: sensitiveRouteConfig, schema: { tags: ['Administration'] }, preValidation: ownerPreValidation },
		resendOwnershipTransferController,
	);

	server.delete(
		'/administration/ownership-transfer',
		{ config: sensitiveRouteConfig, schema: { tags: ['Administration'] }, preValidation: ownerPreValidation },
		cancelOwnershipTransferController,
	);
};

export const administrationRoutes = pluginGenerator(routes);
