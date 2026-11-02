import fs from 'node:fs';
import path from 'node:path';
import { parseNodeEnv } from '@/env/node';
import { getRootPath } from '@/shared/helpers/getRootPath.helper';

export const getSessionKeyFilePath = () => {
	const { NODE_ENV } = parseNodeEnv();
	if (['testing'].includes(NODE_ENV)) {
		return '';
	}
	const root = getRootPath();

	return fs.readFileSync(path.join(root, 'secret-key'));
};
