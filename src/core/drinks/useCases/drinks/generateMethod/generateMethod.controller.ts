import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { i18n } from '@/infrastructure/i18n';
import { resolveGenerateMethodService } from './generateMethod.container';
import { GenerateMethodReqBody } from './generateMethod.dtos';

export const generateMethodController: Controller<{ Body: GenerateMethodReqBody }> = async (request, reply) => {
	const { ingredients, garnishes, preparation } = request.body;
	const service = resolveGenerateMethodService();
	const { warnings, ...method } = await service.execute({ ingredients, garnishes, preparation });

	// Warnings are described like the field errors of a failed request, message included.
	return reply.send({
		...method,
		warnings: warnings.map((warning) => ({
			...warning,
			message: i18n.translate(request.locale, warning.localeKey, warning.params),
		})),
	});
};
