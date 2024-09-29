export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

export const MIME_TYPE_SEPARATOR = '/';
export const FILE_EXTENSION_SEPARATOR = '.';
export const FILE_PATH_SEPARATOR = '/';

export const SUPPORTED_MIME_TYPES: Record<string, string[]> = {
	image: ['jpg', 'jpeg', 'png', 'webp'],
	application: ['pdf', 'xml'],
	text: ['csv', 'plain', 'xml'],
};
