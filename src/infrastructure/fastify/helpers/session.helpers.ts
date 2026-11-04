import fs from 'node:fs';
import path from 'node:path';
import { parseNodeEnv } from '@/env/node';
import { getRootPath } from '@/shared/helpers/getRootPath.helper';

/**
 * Base64-encoded 32-byte key used only in the `testing` environment (which also
 * backs the e2e suite).
 *
 * `@fastify/secure-session` base64-decodes a string `key` and requires exactly
 * `crypto_secretbox_KEYBYTES` (32) bytes, so this must stay a valid 32-byte
 * base64 value. It is intentionally not a real secret: sessions signed with it
 * carry no security guarantee, which is acceptable in tests but never in
 * production.
 */
const DUMMY_SESSION_KEY = 'VkPV76jK62ZYgLQyVe887sZTG+X3bHE9rnlVZBdPEtQ=';

/**
 * Resolves the session key passed to `@fastify/secure-session`.
 *
 * In the `testing` environment it returns a fixed dummy key, so the suites need
 * no generated `secret-key` file. Every other environment (development,
 * production) reads the real 32-byte key from the `secret-key` file at the
 * project root.
 */
export const getSessionKey = (): string | Buffer => {
	const { NODE_ENV } = parseNodeEnv();
	if (NODE_ENV === 'testing') {
		return DUMMY_SESSION_KEY;
	}
	const root = getRootPath();

	return fs.readFileSync(path.join(root, 'secret-key'));
};
