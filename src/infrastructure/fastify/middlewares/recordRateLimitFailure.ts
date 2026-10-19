import { OnError } from '../types/fastify.types';

export const recordRateLimitFailure: OnError = async (request, _reply, error) => {
	const policy = request.routeOptions.config.rateLimitPolicy;
	if (policy === undefined) {
		return;
	}

	const shouldCount = policy.shouldCountFailure ? policy.shouldCountFailure(error) : true;
	if (!shouldCount) {
		return;
	}

	await policy.limiter(request);
};
