import { SessionVersionMarkerUnavailableReasons } from '@/core/accounts/constants/sessionVersionMarker.constants';
import {
	ISessionVersionMarkerStore,
	SessionVersionMarkerLookup,
	SessionVersionMarkerUnavailableReason,
} from '@/core/accounts/stores/ISessionVersionMarker.store';

export class SessionVersionMarkerStoreInMemory implements ISessionVersionMarkerStore {
	collection = new Map<string, number>();
	unavailableReason: SessionVersionMarkerUnavailableReason | null = null;
	failWrites = false;

	async raise(userId: string, minimumSessionVersion: number): Promise<void> {
		if (this.failWrites) {
			throw new Error('Session version marker store is unavailable');
		}
		const current = this.collection.get(userId);
		if (current === undefined || minimumSessionVersion > current) {
			this.collection.set(userId, minimumSessionVersion);
		}
	}

	async find(userId: string): Promise<SessionVersionMarkerLookup> {
		if (this.unavailableReason) {
			return { status: 'unavailable', reason: this.unavailableReason };
		}
		return { status: 'available', minimumSessionVersion: this.collection.get(userId) ?? null };
	}

	makeUnavailable(reason: SessionVersionMarkerUnavailableReason = SessionVersionMarkerUnavailableReasons.storeError) {
		this.unavailableReason = reason;
	}
}
