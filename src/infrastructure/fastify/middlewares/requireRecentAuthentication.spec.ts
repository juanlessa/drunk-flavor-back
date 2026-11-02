import { describe, expect, it, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { RECENT_AUTHENTICATION_WINDOW_MS, requireRecentAuthentication } from './requireRecentAuthentication';

const requestWith = (session: Record<string, unknown> | undefined) =>
	({
		session: { get: vi.fn(() => session) },
	}) as unknown as FastifyRequest;

describe('requireRecentAuthentication', () => {
	it('accepts a recently authenticated session', async () => {
		const request = requestWith({ authenticatedAt: new Date().toISOString() });

		await expect(requireRecentAuthentication(request, {} as FastifyReply)).resolves.toBeUndefined();
	});

	it('accepts a recent step-up over the original authentication timestamp', async () => {
		const request = requestWith({
			authenticatedAt: new Date(Date.now() - RECENT_AUTHENTICATION_WINDOW_MS * 2).toISOString(),
			reauthenticatedAt: new Date().toISOString(),
		});

		await expect(requireRecentAuthentication(request, {} as FastifyReply)).resolves.toBeUndefined();
	});

	it('rejects a stale or missing authentication timestamp', async () => {
		const stale = requestWith({
			authenticatedAt: new Date(Date.now() - RECENT_AUTHENTICATION_WINDOW_MS - 1).toISOString(),
		});

		await expect(requireRecentAuthentication(stale, {} as FastifyReply)).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(requireRecentAuthentication(requestWith(undefined), {} as FastifyReply)).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
	});
});
