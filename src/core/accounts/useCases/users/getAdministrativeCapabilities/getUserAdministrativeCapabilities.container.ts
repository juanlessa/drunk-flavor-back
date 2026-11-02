import {
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveOwnershipTransferInvitationsRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveDateProvider } from '@/shared/providers/date';
import { GetUserAdministrativeCapabilitiesService } from './GetUserAdministrativeCapabilities.service';

const service = new GetUserAdministrativeCapabilitiesService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveIdentitiesRepository(),
	resolveOwnershipTransferInvitationsRepository(),
	resolveDateProvider(),
);

export const resolveGetUserAdministrativeCapabilitiesService = () => service;
