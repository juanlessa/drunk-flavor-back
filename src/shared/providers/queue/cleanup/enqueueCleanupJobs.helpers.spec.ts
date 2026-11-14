import { describe, expect, it, vi } from 'vitest';
import { logger } from '@/shared/providers/logger';
import { deleteCommentsJob, deleteStorageFileJob } from './cleanupJobs';
import { enqueueCleanupJobs } from './enqueueCleanupJobs.helpers';
import { MockCleanupQueueProvider } from './implementations/MockCleanupQueue.provider';

vi.mock('@/shared/providers/logger', () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn() },
}));

describe('enqueueCleanupJobs', () => {
	it('should enqueue every job with its deduplication key', async () => {
		const queue = new MockCleanupQueueProvider();
		await enqueueCleanupJobs(queue, [deleteCommentsJob('user-1'), deleteStorageFileJob('a.png')], {});
		expect(queue.addMock).toHaveBeenCalledWith(
			'account.delete-comments',
			{ userId: 'user-1' },
			{ deduplicationKey: 'delete-comments-user-1' },
		);
		expect(queue.addMock).toHaveBeenCalledWith(
			'storage.delete-file',
			{ fileName: 'a.png' },
			{ deduplicationKey: 'delete-storage-file-a.png' },
		);
	});

	it('should log a failed job with the context and still enqueue the others', async () => {
		const queue = new MockCleanupQueueProvider();
		queue.addMock.mockRejectedValueOnce(new Error('queue unavailable'));
		await expect(
			enqueueCleanupJobs(queue, [deleteCommentsJob('user-1'), deleteStorageFileJob('a.png')], {
				userId: 'user-1',
			}),
		).resolves.toBeUndefined();
		expect(queue.addMock).toHaveBeenCalledTimes(2);
		expect(logger.error).toHaveBeenCalledWith(
			expect.objectContaining({ jobName: 'account.delete-comments', userId: 'user-1' }),
			'Unable to enqueue cleanup job',
		);
	});
});
