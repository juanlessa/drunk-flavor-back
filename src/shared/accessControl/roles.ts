import { z } from 'zod/v4';

export const Roles = {
	admin: 'admin',
	partner: 'partner',
	member: 'member',
} as const;

export const roleSchema = z.union([z.literal('admin'), z.literal('partner'), z.literal('member')]);

export type Role = (typeof Roles)[keyof typeof Roles];
