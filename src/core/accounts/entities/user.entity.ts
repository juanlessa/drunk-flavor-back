import { Role } from '@/shared/accessControl/roles';
import { EntityMetadata } from '../../../shared/types/entity.types';
import { UserStatuses } from '../constants/user.constants';

export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];

/**
 * User =
 *     id: string
 *     name?: string
 *     surname?: string
 *     status: UserStatus ("idle" | "pending" | "active" | "suspended" | "incomplete_profile")
 *     email: string
 *     emailVerified: boolean
 *     avatarUrl?: string
 *     role: Role ("owner" | "admin" | "partner" | "member")
 *     sessionVersion: number
 *     createdAt: Date
 *     updatedAt: Date
 */
export type User = EntityMetadata & {
	name?: string;
	surname?: string;
	email: string;
	emailVerified: boolean;
	avatarUrl?: string;
	role: Role;
	status: UserStatus;
	sessionVersion: number;
};
