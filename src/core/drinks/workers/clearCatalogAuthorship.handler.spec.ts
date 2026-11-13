import { describe, expect, it, vi } from 'vitest';
import { makeClearCatalogAuthorshipHandler } from './clearCatalogAuthorship.handler';

vi.mock('@/shared/providers/logger', () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn() },
}));

describe('makeClearCatalogAuthorshipHandler', () => {
	it('should clear the authorship of the closed account', async () => {
		const clearCreatorByUser = vi.fn().mockResolvedValue(3);
		await makeClearCatalogAuthorshipHandler({ clearCreatorByUser })({ userId: 'user-1' });
		expect(clearCreatorByUser).toHaveBeenCalledWith({ userId: 'user-1' });
	});

	it('should propagate failures so the engine retries the job', async () => {
		const clearCreatorByUser = vi.fn().mockRejectedValue(new Error('mongo unavailable'));
		await expect(makeClearCatalogAuthorshipHandler({ clearCreatorByUser })({ userId: 'user-1' })).rejects.toThrow(
			'mongo unavailable',
		);
	});
});
