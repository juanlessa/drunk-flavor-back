import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { FindPublicProfilesByIdsService } from './FindPublicProfilesByIds.service';

const usersRepository = resolveUsersRepository();

const findPublicProfilesByIdsService = new FindPublicProfilesByIdsService(usersRepository);

export const resolveFindPublicProfilesByIdsService = () => findPublicProfilesByIdsService;
