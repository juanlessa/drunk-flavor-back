import { describe, expect, it, vi } from 'vitest';
import { makeDeleteDrinkEngagementHandler } from './deleteDrinkEngagement.handler';

vi.mock('@/shared/providers/logger', () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn() },
}));

describe('makeDeleteDrinkEngagementHandler', () => {
	it('should delete the engagement of the removed drink', async () => {
		const deleteEngagementByDrink = vi.fn().mockResolvedValue({ comments: 2, ratings: 1, favorites: 3 });
		await makeDeleteDrinkEngagementHandler({ deleteEngagementByDrink })({ drinkId: 'drink-1' });
		expect(deleteEngagementByDrink).toHaveBeenCalledWith({ drinkId: 'drink-1' });
	});

	it('should propagate failures so the engine retries the job', async () => {
		const deleteEngagementByDrink = vi.fn().mockRejectedValue(new Error('mongo unavailable'));
		await expect(
			makeDeleteDrinkEngagementHandler({ deleteEngagementByDrink })({ drinkId: 'drink-1' }),
		).rejects.toThrow('mongo unavailable');
	});
});
