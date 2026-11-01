import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Roles } from '@/shared/accessControl/roles';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { HTTP_STATUS } from '@/shared/constants/http.constants';

const executeMock = vi.hoisted(() => vi.fn());

vi.mock('./revokeUserSessions.container', () => ({
	resolveRevokeUserSessionsService: () => ({ execute: executeMock }),
}));

import { revokeUserSessionsController } from './revokeUserSessions.controller';
import { revokeUserSessionsParamsSchema } from './revokeUserSessions.schema';

describe('revokeUserSessionsController', () => {
	beforeEach(() => {
		executeMock.mockReset();
	});

	it('rejects a directly parsed params object without an id', () => {
		const result = revokeUserSessionsParamsSchema.safeParse({});
		const issue = result.success ? undefined : result.error.issues[0];
		expect(result.success).toBe(false);
		expect(issue?.message).toBe('apiResponses.users.requiredId');
	});

	it('maps the authenticated actor and returns an empty 204 response', async () => {
		executeMock.mockResolvedValue(undefined);
		const send = vi.fn();
		const status = vi.fn(() => ({ send }));
		const request = {
			id: 'request-id',
			params: { id: 'target-id' },
			body: { reason: 'Security review required this action' },
			user: { id: 'actor-id', role: Roles.owner, status: UserStatuses.active, sessionVersion: 7 },
		};

		await revokeUserSessionsController(request as never, { status } as never);

		expect(executeMock).toHaveBeenCalledWith({
			id: 'target-id',
			reason: 'Security review required this action',
			actor: { id: 'actor-id', role: Roles.owner, sessionVersion: 7 },
			administrativeContext: { origin: 'api', requestId: 'request-id' },
		});
		expect(status).toHaveBeenCalledWith(HTTP_STATUS.no_content);
		expect(send).toHaveBeenCalledWith();
	});

	it('propagates service failures without sending a response', async () => {
		const failure = new Error('service failed');
		executeMock.mockRejectedValue(failure);
		const status = vi.fn();
		const request = {
			id: 'request-id',
			params: { id: 'target-id' },
			body: { reason: 'Security review required this action' },
			user: { id: 'actor-id', role: Roles.owner, status: UserStatuses.active, sessionVersion: 7 },
		};

		await expect(revokeUserSessionsController(request as never, { status } as never)).rejects.toBe(failure);
		expect(status).not.toHaveBeenCalled();
	});
});
