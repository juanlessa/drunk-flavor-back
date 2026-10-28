import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { AccountsModule } from './AccountsModule';
import { IAccountsModule } from './IAccountsModule';

const accountsModule: IAccountsModule = new AccountsModule(resolveUsersRepository());

export const resolveAccountsModule = (): IAccountsModule => accountsModule;

export { AccountsModule } from './AccountsModule';
export type { IAccountsModule } from './IAccountsModule';
