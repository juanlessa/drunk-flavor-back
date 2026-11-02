import { FileStream } from '@/infrastructure/fastify/types/multipart.types';

export type UpdateAvatarDTO = {
	userId: string;
	fileStream: FileStream;
	mimetype: string;
};
