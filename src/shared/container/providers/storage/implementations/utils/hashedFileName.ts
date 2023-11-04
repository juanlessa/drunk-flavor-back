import crypto from 'node:crypto';

export const hashedFileName = (fileName: string) => {
	const hash = crypto.randomBytes(16).toString('hex');
	return `${hash}-${fileName}`;
};
