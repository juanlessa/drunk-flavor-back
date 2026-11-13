import {
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { GetProfileService } from './GetProfile.service';

const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();

const getProfileService = new GetProfileService(usersRepository, credentialsRepository, identitiesRepository);

export const resolveGetProfileService = () => getProfileService;
