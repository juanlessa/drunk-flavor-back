import { User, UserStatus } from '@/core/accounts/entities/user.entity';
import { Role } from '@/shared/accessControl/roles';
import { EntityMetadata } from '@/shared/types/entity.types';

export type CreateUser = Omit<User, keyof EntityMetadata>;

export type UpdateUser = Pick<User, 'id'> & Partial<Omit<User, keyof EntityMetadata>>;
