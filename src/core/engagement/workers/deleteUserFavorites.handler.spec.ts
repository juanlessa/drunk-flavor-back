import { describe, expect, it, vi } from 'vitest';
import { makeDeleteUserFavoritesHandler } from './deleteUserFavorites.handler';

vi.mock('@/shared/providers/logger', () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn() },
}));

describe('makeDeleteUserFavoritesHandler', () => {
	it('should delete the favorites of the closed account', async () => {
		const deleteFavoritesByUser = vi.fn().mockResolvedValue(4);

		await makeDeleteUserFavoritesHandler({ deleteFavoritesByUser })({ userId: 'user-1' });

		expect(deleteFavoritesByUser).toHaveBeenCalledWith({ userId: 'user-1' });
	});

	it('should propagate failures so the engine retries the job', async () => {
		const deleteFavoritesByUser = vi.fn().mockRejectedValue(new Error('mongo unavailable'));

		await expect(makeDeleteUserFavoritesHandler({ deleteFavoritesByUser })({ userId: 'user-1' })).rejects.toThrow(
			'mongo unavailable',
		);
	});
});
