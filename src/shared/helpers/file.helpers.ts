import crypto from 'node:crypto';
import path from 'node:path';
import {
	FILE_EXTENSION_SEPARATOR,
	FILE_PATH_SEPARATOR,
	MIME_TYPE_SEPARATOR,
	SUPPORTED_MIME_TYPES,
} from '../constants/file.constants';

/**
 * Builds a fully server-controlled stored file name: `<hash>-<ownerId>-<role>.<ext>`.
 *
 * None of the segments come from the client-supplied upload name, which prevents path
 * traversal: the random hash provides entropy, the owner id and role give traceability
 * (which entity the image belongs to and its purpose), and the extension is derived from
 * the already-validated mime type rather than from the uploaded file name.
 */
export const generateStoredFileName = (ownerId: string, role: string, mimetype: string): string => {
	const hash = crypto.randomBytes(16).toString('hex');
	const [, subtype] = splitMimeType(mimetype);
	const name = `${hash}-${ownerId}-${role}.${subtype}`;
	assertSafeFileName(name);
	return name;
};

/**
 * Guards against any file name that could escape its storage directory. A safe name has no
 * path separators, no parent-directory segments and no NUL byte, so it addresses exactly one
 * file inside the intended folder. Throws otherwise.
 */
export const assertSafeFileName = (name: string): void => {
	const isUnsafe =
		name.length === 0 ||
		name !== path.basename(name) ||
		name.includes('..') ||
		name.includes('/') ||
		name.includes('\\') ||
		name.includes('\0');

	if (isUnsafe) {
		throw new Error(`Unsafe file name rejected: ${JSON.stringify(name)}`);
	}
};

export const splitMimeType = (mimetype: string): [string, string] => {
	const [type, subtype] = mimetype.split(MIME_TYPE_SEPARATOR);
	return [type, subtype];
};

export const isSupportedFileType = (expectedType: string, mimetype: string) => {
	const [type, subType] = splitMimeType(mimetype);
	return expectedType === type && SUPPORTED_MIME_TYPES[type].includes(subType);
};

export const hasFileExtension = (name: string, mimetype: string) => {
	const fileExtension = name.split(FILE_EXTENSION_SEPARATOR).pop() ?? '';
	const [_, subtype] = splitMimeType(mimetype);
	return subtype === fileExtension;
};

export const removeFileExtension = (name: string, mimetype: string) => {
	if (!hasFileExtension(name, mimetype)) {
		return name;
	}
	return name.split(FILE_EXTENSION_SEPARATOR).splice(-1, 1).join(FILE_EXTENSION_SEPARATOR);
};

export const setFileExtension = (name: string, mimetype: string) => {
	if (hasFileExtension(name, mimetype)) {
		return name;
	}
	const [, subType] = splitMimeType(mimetype);
	return name.concat(`.${subType}`);
};

export const getFileName = (path: string) => {
	return path.split(FILE_PATH_SEPARATOR).pop() ?? '';
};
