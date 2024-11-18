import { z } from 'zod';

export enum RolesEnum {
	admin = 'admin',
	partner = 'partner',
	member = 'member',
}

export const roleSchema = z.union([z.literal('admin'), z.literal('partner'), z.literal('member')]);

export type Role = keyof typeof RolesEnum;
