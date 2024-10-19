import '@fastify/jwt';
import 'fastify';
import { VerifyPayloadType, SignPayloadType, FastifyJwtSignOptions, FastifyJwtVerifyOptions } from '@fastify/jwt';
import { DecodedToken } from '@/infrastructure/fastify/types/jwt.types';
import type { Role } from '@/shared/accessControl/roles';

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: {
			id: string;
			role: Role;
		};
	}
}

declare module 'fastify' {
	interface FastifyRequest {
		jwtVerify<T extends VerifyPayloadType = DecodedToken>(options?: FastifyJwtVerifyOptions): Promise<T>;

		sessionJwtVerify<T extends VerifyPayloadType = DecodedToken>(options?: FastifyJwtVerifyOptions): Promise<T>;
	}
	interface FastifyReply {
		sessionJwtSign(payload: SignPayloadType, options?: FastifyJwtSignOptions): Promise<string>;
	}
}
