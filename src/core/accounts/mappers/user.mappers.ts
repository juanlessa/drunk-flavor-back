import { User } from '@/core/accounts/entities/user.entity';

export type UserView = Omit<User, 'sessionVersion'>;

export const toUserView = ({ sessionVersion: _sessionVersion, ...user }: User): UserView => user;
