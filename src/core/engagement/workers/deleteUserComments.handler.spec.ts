import { describe, expect, it, vi } from 'vitest';
import { makeDeleteUserCommentsHandler } from './deleteUserComments.handler';

vi.mock('@/shared/providers/logger', () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn() },
}));

describe('makeDeleteUserCommentsHandler', () => {
	it('should delete the comments of the closed account', async () => {
		const deleteCommentsByUser = vi.fn().mockResolvedValue(4);
		await makeDeleteUserCommentsHandler({ deleteCommentsByUser })({ userId: 'user-1' });
		expect(deleteCommentsByUser).toHaveBeenCalledWith({ userId: 'user-1' });
	});

	it('should propagate failures so the engine retries the job', async () => {
		const deleteCommentsByUser = vi.fn().mockRejectedValue(new Error('mongo unavailable'));
		await expect(makeDeleteUserCommentsHandler({ deleteCommentsByUser })({ userId: 'user-1' })).rejects.toThrow(
			'mongo unavailable',
		);
	});
});
