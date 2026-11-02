/** Outcome labels logged for each ongoing-session validation, used to observe how often the user store is skipped. */
export const SessionChecks = {
	markerTrusted: 'markerTrusted',
	markerStale: 'markerStale',
	claimsUnusable: 'claimsUnusable',
	markerStoreUnavailable: 'markerStoreUnavailable',
} as const;
