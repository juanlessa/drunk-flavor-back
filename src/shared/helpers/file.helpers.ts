import crypto from 'node:crypto';
import { IMAGE_MIME_TYPES } from '../constants/file.constants';

export const isImageFile = (mimetype: string) => IMAGE_MIME_TYPES.includes(mimetype);

export const generateHashedName = (name: string) => {
	const hash = crypto.randomBytes(16).toString('hex');
	return `${hash}-${name}`;
};
