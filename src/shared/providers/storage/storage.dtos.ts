import { FileStream } from '@/infrastructure/fastify/types/storage,types';

export type UploadFileOptions = {
	fileStream: FileStream;
	mimetype: string;
	name: string;
};
