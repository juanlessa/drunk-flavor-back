import { User } from '@/core/accounts/entities/user.entity';

export type AuthenticatedSession = Pick<User, 'id' | 'role' | 'status' | 'sessionVersion'>;
