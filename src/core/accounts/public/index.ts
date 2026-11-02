import { AccountsModule } from './AccountsModule';
import { IAccountsModule } from './IAccountsModule';
import { resolveFindPublicProfilesByIdsService } from './findPublicProfilesByIds/findPublicProfilesByIds.container';
import { resolveFindUserByIdService } from './findUserById/findUserById.container';
import { resolveValidateOngoingSessionService } from './validateOngoingSession/validateOngoingSession.container';
import { resolveValidateSessionRenewalService } from './validateSessionRenewal/validateSessionRenewal.container';

const accountsModule: IAccountsModule = new AccountsModule(
	resolveFindUserByIdService(),
	resolveFindPublicProfilesByIdsService(),
	resolveValidateOngoingSessionService(),
	resolveValidateSessionRenewalService(),
);

export const resolveAccountsModule = (): IAccountsModule => accountsModule;

export { AccountsModule } from './AccountsModule';
export type { IAccountsModule } from './IAccountsModule';
export type { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
export type { PublicProfile } from './findPublicProfilesByIds/findPublicProfilesByIds.dtos';
