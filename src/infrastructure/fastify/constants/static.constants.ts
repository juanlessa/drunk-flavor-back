import { getRootPath } from '@/shared/helpers/getRootPath.helper';
import {
	STATIC_FILES_FOLDER_NAME,
	STATIC_FILES_PREFIX,
	STATIC_FOLDER_PATH,
} from '@/shared/providers/storage/storage.constants';
import { FastifyStaticOptions } from '@fastify/static';
import path from 'node:path';
import { getAppURL } from '../helpers/fastify.helpers';

export { STATIC_FOLDER_PATH };

export const STATIC_FILES_URL = getAppURL().concat(STATIC_FILES_PREFIX);

export const STATIC_FILES_OPTIONS = {
	root: path.join(getRootPath(), STATIC_FILES_FOLDER_NAME),
	prefix: STATIC_FILES_PREFIX,
} satisfies FastifyStaticOptions;
