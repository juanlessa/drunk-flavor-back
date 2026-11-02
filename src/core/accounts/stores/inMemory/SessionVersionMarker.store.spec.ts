import { beforeEach, describe, expect, it } from 'vitest';
import { SessionVersionMarkerUnavailableReasons } from '@/core/accounts/constants/sessionVersionMarker.constants';
import { SessionVersionMarkerStoreInMemory } from './SessionVersionMarker.store';

let store: SessionVersionMarkerStoreInMemory;

describe('SessionVersionMarkerStoreInMemory', () => {
	beforeEach(() => {
		store = new SessionVersionMarkerStoreInMemory();
	});

	it('reports no marker for a user without session-affecting changes', async () => {
		await expect(store.find('user-id')).resolves.toEqual({ status: 'available', minimumSessionVersion: null });
	});

	it('keeps the highest raised version', async () => {
		await store.raise('user-id', 5);
		await store.raise('user-id', 3);

		await expect(store.find('user-id')).resolves.toEqual({ status: 'available', minimumSessionVersion: 5 });
	});

	it('reports the configured unavailability reason', async () => {
		store.makeUnavailable(SessionVersionMarkerUnavailableReasons.storeNotReady);

		await expect(store.find('user-id')).resolves.toEqual({
			status: 'unavailable',
			reason: SessionVersionMarkerUnavailableReasons.storeNotReady,
		});
	});

	it('fails writes when configured to simulate an unavailable store', async () => {
		store.failWrites = true;

		await expect(store.raise('user-id', 1)).rejects.toThrow();
	});
});
