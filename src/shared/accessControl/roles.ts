import { z } from 'zod/v4';
import type { LocaleKey } from '@/shared/types/locale.types';

const INVALID_ROLE = 'apiResponses.users.invalidRoleFormat' satisfies LocaleKey;

export const Roles = {
	owner: 'owner',
	admin: 'admin',
	partner: 'partner',
	member: 'member',
} as const;

export const roleSchema = z.union(
	[z.literal(Roles.owner), z.literal(Roles.admin), z.literal(Roles.partner), z.literal(Roles.member)],
	{ error: INVALID_ROLE },
);

export const nonOwnerRoleSchema = z.union([z.literal(Roles.admin), z.literal(Roles.partner), z.literal(Roles.member)], {
	error: INVALID_ROLE,
});

export type Role = (typeof Roles)[keyof typeof Roles];
export type NonOwnerRole = z.infer<typeof nonOwnerRoleSchema>;
