import { MAX_IMAGE_SIZE } from '@/shared/constants/file.constants';
import { FastifyMultipartOptions } from '@fastify/multipart';

export const MULTIPART_OPTIONS = {
	limits: {
		files: 1,
		fileSize: MAX_IMAGE_SIZE,
	},
} satisfies FastifyMultipartOptions;
