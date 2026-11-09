import request, { Test } from 'supertest';

/**
 * Sends a request with the HTTP QUERY method (RFC 10008): a safe read whose input travels in the body.
 * On the agent, supertest's `query(url)` is the QUERY method; its types only describe the `query` that sets the
 * query string of a request already made, so they are narrowed here to keep the casts out of the tests.
 */
export const queryRequest = (server: Parameters<typeof request>[0], url: string): Test =>
	(request(server) as unknown as { query: (url: string) => Test }).query(url);
