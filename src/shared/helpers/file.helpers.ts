import crypto from 'node:crypto';
import {
	FILE_EXTENSION_SEPARATOR,
	FILE_PATH_SEPARATOR,
	MIME_TYPE_SEPARATOR,
	SUPPORTED_MIME_TYPES,
} from '../constants/file.constants';

export const generateHashedName = (name: string) => {
	const hash = crypto.randomBytes(16).toString('hex');
	return `${hash}-${name}`;
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
