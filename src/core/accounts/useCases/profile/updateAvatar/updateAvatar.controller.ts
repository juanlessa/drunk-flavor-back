import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { BadRequestError } from '@/shared/error/error.lib';
import { resolveUpdateAvatarService } from './updateAvatar.container';

export const updateAvatarController: Controller = async (request, reply) => {
	const data = await request.file();
	if (!data) {
		throw new BadRequestError('apiResponses.profile.avatarRequired', {
			path: 'UpdateAvatar.controller',
			cause: 'Avatar file is required',
		});
	}

	const { id } = request.user;
	const { file, mimetype } = data;
	const service = resolveUpdateAvatarService();
	await service.execute({ userId: id, fileStream: file, mimetype });

	return reply.status(HTTP_STATUS.no_content).send();
};
