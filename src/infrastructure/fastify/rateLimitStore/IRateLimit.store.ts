export type RateLimitCallback = (error: Error | null, result: { current: number; ttl: number } | null) => void;

export interface RateLimitRouteOptions {
	continueExceeding?: boolean;
	routeInfo?: { method?: string; url?: string };
}

export interface IRateLimitStore {
	child(routeOptions?: RateLimitRouteOptions): IRateLimitStore;
	incr(key: string, callback: RateLimitCallback, timeWindow: number, max: number): void;
	read(key: string, callback: RateLimitCallback): void;
	reset(): Promise<number>;
}
