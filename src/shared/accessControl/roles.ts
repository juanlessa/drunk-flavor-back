import { z } from 'zod/v4';

export const Roles = {
	owner: 'owner',
	admin: 'admin',
	partner: 'partner',
	member: 'member',
} as const;

export const roleSchema = z.union([
	z.literal(Roles.owner),
	z.literal(Roles.admin),
	z.literal(Roles.partner),
	z.literal(Roles.member),
]);

export const nonOwnerRoleSchema = z.union([z.literal(Roles.admin), z.literal(Roles.partner), z.literal(Roles.member)]);

export type Role = (typeof Roles)[keyof typeof Roles];
export type NonOwnerRole = z.infer<typeof nonOwnerRoleSchema>;
