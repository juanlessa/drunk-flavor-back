import path from 'node:path';
import { getRootPath } from '@/shared/helpers/getRootPath.helper';

export const STATIC_FILES_PREFIX = '/files/';
export const STATIC_FILES_FOLDER_NAME = 'tmp';
export const STATIC_FOLDER_PATH = path.join(getRootPath(), STATIC_FILES_FOLDER_NAME);
