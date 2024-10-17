import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { RefreshTokenService } from './RefreshToken.service';

const usersRepository = resolveUsersRepository();

const refreshTokenService = new RefreshTokenService(usersRepository);
export const resolveRefreshTokenService = () => refreshTokenService;
