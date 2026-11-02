import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { FindPublicProfilesByIdsService } from './FindPublicProfilesByIds.service';

const findPublicProfilesByIdsService = new FindPublicProfilesByIdsService(resolveUsersRepository());

export const resolveFindPublicProfilesByIdsService = () => findPublicProfilesByIdsService;
