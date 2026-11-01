import { AccountsModule } from './AccountsModule';
import { IAccountsModule } from './IAccountsModule';
import { resolveFindUserByIdService } from './findUserById/findUserById.container';
import { resolveValidateOngoingSessionService } from './validateOngoingSession/validateOngoingSession.container';
import { resolveValidateSessionRenewalService } from './validateSessionRenewal/validateSessionRenewal.container';

const accountsModule: IAccountsModule = new AccountsModule(
	resolveFindUserByIdService(),
	resolveValidateOngoingSessionService(),
	resolveValidateSessionRenewalService(),
);

export const resolveAccountsModule = (): IAccountsModule => accountsModule;

export { AccountsModule } from './AccountsModule';
export type { IAccountsModule } from './IAccountsModule';
export type { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
