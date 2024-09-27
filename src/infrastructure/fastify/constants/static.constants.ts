import { env } from '@/env';
import { getRootPath } from '@/shared/helpers/getRootPath.helper';
import { FastifyStaticOptions } from '@fastify/static';
import path from 'node:path';
import { getAppURL } from '../helpers/fastify.helpers';

const STATIC_FILES_PREFIX = '/files/';
const STATIC_FILES_FOLDER_NAME = 'tmp';

export const STATIC_FOLDER_PATH = path.join(getRootPath(), STATIC_FILES_FOLDER_NAME);
export const STATIC_FILES_URL = getAppURL().concat(STATIC_FILES_PREFIX);

export const STATIC_FILES_OPTIONS = {
	root: path.join(getRootPath(), STATIC_FILES_FOLDER_NAME),
	prefix: STATIC_FILES_PREFIX,
} satisfies FastifyStaticOptions;
