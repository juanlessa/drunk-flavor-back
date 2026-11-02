import {
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { GetProfileService } from './GetProfile.service';

const getProfileService = new GetProfileService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveIdentitiesRepository(),
);

export const resolveGetProfileService = () => getProfileService;
