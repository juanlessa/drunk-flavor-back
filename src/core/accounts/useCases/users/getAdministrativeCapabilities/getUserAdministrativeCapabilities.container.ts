import {
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveOwnershipTransferInvitationsRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveDateProvider } from '@/shared/providers/date';
import { GetUserAdministrativeCapabilitiesService } from './GetUserAdministrativeCapabilities.service';

const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const ownershipTransferInvitationsRepository = resolveOwnershipTransferInvitationsRepository();
const dateProvider = resolveDateProvider();

const getUserAdministrativeCapabilitiesService = new GetUserAdministrativeCapabilitiesService(
	usersRepository,
	credentialsRepository,
	identitiesRepository,
	ownershipTransferInvitationsRepository,
	dateProvider,
);

export const resolveGetUserAdministrativeCapabilitiesService = () => getUserAdministrativeCapabilitiesService;
