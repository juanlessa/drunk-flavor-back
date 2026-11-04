import fs from 'node:fs';
import path from 'node:path';
import { parseNodeEnv } from '@/env/node';
import { getRootPath } from '@/shared/helpers/getRootPath.helper';

const DUMMY_SESSION_KEY = 'VkPV76jK62ZYgLQyVe887sZTG+X3bHE9rnlVZBdPEtQ=';

export const getSessionKey = (): string | Buffer => {
	const { NODE_ENV } = parseNodeEnv();
	if (['testing', 'e2e'].includes(NODE_ENV)) {
		return DUMMY_SESSION_KEY;
	}
	const root = getRootPath();

	return fs.readFileSync(path.join(root, 'secret-key'));
};
