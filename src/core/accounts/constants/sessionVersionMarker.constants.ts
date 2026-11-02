/** Redis key prefix for the minimum accepted session version of a user: `auth:session-version:{userId}`. */
export const SESSION_VERSION_MARKER_KEY_PREFIX = 'auth:session-version:';

/**
 * Redis key holding the epoch milliseconds at which the marker store started tracking writes. Markers are only
 * trusted once this key is older than one marker TTL, which protects against a Redis restart or flush that
 * silently dropped markers still needed by unexpired access tokens.
 */
export const SESSION_VERSION_MARKER_STORE_READY_KEY = 'auth:session-version-store:ready-at';

/** Safety margin added to the access-token lifetime so a marker always outlives every token it can invalidate. */
export const SESSION_VERSION_MARKER_TTL_MARGIN_SECONDS = 60;

/** Reads sit on the authenticated request hot path, so a slow store falls back to the authoritative user store. */
export const SESSION_VERSION_MARKER_READ_TIMEOUT_MS = 100;

/** Writes run inside the mutation transaction; a slow store aborts the mutation instead of risking a lost marker. */
export const SESSION_VERSION_MARKER_WRITE_TIMEOUT_MS = 1000;

export const SessionVersionMarkerUnavailableReasons = {
	storeNotReady: 'storeNotReady',
	storeError: 'storeError',
} as const;
