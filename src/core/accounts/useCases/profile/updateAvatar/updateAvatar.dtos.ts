import { FileStream } from '@/infrastructure/fastify/types/multipart.types';

export type UpdateAvatarCommand = {
	userId: string;
	fileStream: FileStream;
	mimetype: string;
};
