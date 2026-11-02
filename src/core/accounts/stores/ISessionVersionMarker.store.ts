import { SessionVersionMarkerUnavailableReasons } from '@/core/accounts/constants/sessionVersionMarker.constants';

export type SessionVersionMarkerUnavailableReason =
	(typeof SessionVersionMarkerUnavailableReasons)[keyof typeof SessionVersionMarkerUnavailableReasons];

/**
 * Result of a marker lookup.
 *
 * - `available` with `minimumSessionVersion: null`: no session-affecting change happened within one access-token
 *   lifetime, so the session claims of an unexpired access token can be trusted.
 * - `available` with a number: tokens below that version must be checked against the authoritative user store.
 * - `unavailable`: the marker store cannot be trusted; callers must consult the authoritative user store.
 */
export type SessionVersionMarkerLookup =
	| { status: 'available'; minimumSessionVersion: number | null }
	| { status: 'unavailable'; reason: SessionVersionMarkerUnavailableReason };

/**
 * Short-lived "not-before" hints that tell the authentication layer when a user's unexpired access tokens may be
 * stale. A marker is never the source of truth nor the authorization decision: the persisted `sessionVersion` is.
 * A spurious or too-high marker only causes an extra authoritative lookup, which makes it safe to raise a marker
 * before the surrounding transaction commits.
 */
export interface ISessionVersionMarkerStore {
	/** Raises the user's minimum accepted session version and restarts its TTL. Throws when it cannot persist. */
	raise(userId: string, minimumSessionVersion: number): Promise<void>;
	/** Never throws: store failures are reported as `unavailable`. */
	find(userId: string): Promise<SessionVersionMarkerLookup>;
}
