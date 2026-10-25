import { describe, expect, it } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from '@/shared/error/error.lib';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { Roles } from '@/shared/accessControl/roles';
import { UserStatus } from '@/core/accounts/entities/user.entity';
import { enforceCompleteProfile } from './enforceCompleteProfile';

const buildRequest = (status: UserStatus) =>
	({ user: { id: 'user-id', role: Roles.member, status } }) as unknown as FastifyRequest;

const reply = {} as FastifyReply;

describe('enforceCompleteProfile', () => {
	it('throws a ForbiddenError when the user has an incomplete profile', async () => {
		const request = buildRequest(UserStatuses.incomplete_profile);

		await expect(enforceCompleteProfile(request, reply)).rejects.toBeInstanceOf(ForbiddenError);
		await expect(enforceCompleteProfile(request, reply)).rejects.toThrow('apiResponses.auth.profileIncomplete');
	});

	it('resolves without throwing for a complete (active) user', async () => {
		const request = buildRequest(UserStatuses.active);

		await expect(enforceCompleteProfile(request, reply)).resolves.toBeUndefined();
	});
});
