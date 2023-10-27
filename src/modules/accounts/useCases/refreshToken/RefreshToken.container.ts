import { resolveUsersTokensRepository } from '@modules/accounts/container';
import { RefreshTokenService } from '@modules/accounts/useCases/refreshToken/RefreshToken.service';
import { resolveDateProvider } from '@shared/container/providers/date';
import { resolveJwtProvider } from '@shared/container/providers/jwt';

const dateProvider = resolveDateProvider();
const jwtProvider = resolveJwtProvider();
const usersTokensRepository = resolveUsersTokensRepository();

const refreshTokenService = new RefreshTokenService(usersTokensRepository, dateProvider, jwtProvider);
export const resolveRefreshTokenService = () => refreshTokenService;
