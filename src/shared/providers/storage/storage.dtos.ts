import { FileStream } from '@/infrastructure/fastify/types/multipart.types';

export type UploadFileOptions = {
	fileStream: FileStream;
	mimetype: string;
	name: string;
};
