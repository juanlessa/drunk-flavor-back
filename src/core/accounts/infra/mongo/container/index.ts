import { UsersRepository } from '@/core/accounts/infra/mongo/repositories/Users.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITokensRepository } from '../../../repositories/ITokens.repository';
import { TokensRepository } from '../repositories/Tokens.repository';
import { ICredentialsRepository } from '../../../repositories/ICredentials.repository';
import { CredentialsRepository } from '../repositories/Credentials.repository';
import { IIdentitiesRepository } from '../../../repositories/IIdentities.repository';
import { IdentitiesRepository } from '../repositories/Identities.repository';

const usersRepository: IUsersRepository = new UsersRepository();
export const resolveUsersRepository = () => usersRepository;

const tokensRepository: ITokensRepository = new TokensRepository();
export const resolveTokensRepository = () => tokensRepository;

const credentialsRepository: ICredentialsRepository = new CredentialsRepository();
export const resolveCredentialsRepository = () => credentialsRepository;

const identitiesRepository: IIdentitiesRepository = new IdentitiesRepository();
export const resolveIdentitiesRepository = () => identitiesRepository;
