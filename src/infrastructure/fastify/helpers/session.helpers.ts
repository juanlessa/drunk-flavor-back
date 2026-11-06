import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseNodeEnv } from '@/env/node';
import { getRootPath } from '@/shared/helpers/getRootPath.helper';

const buildDummySessionKey = (): Buffer => crypto.createHash('sha256').update('drunk-flavor-test-session-key').digest();

export const getSessionKey = (): string | Buffer => {
	const { NODE_ENV } = parseNodeEnv();
	if (NODE_ENV === 'testing') {
		return buildDummySessionKey();
	}
	const root = getRootPath();

	return fs.readFileSync(path.join(root, 'secret-key'));
};
