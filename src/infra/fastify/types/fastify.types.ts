import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export type Request = FastifyRequest;
export type Reply = FastifyReply;

export type Controller = <Request extends FastifyRequest = FastifyRequest, Reply extends FastifyReply = FastifyReply>(
	request: Request,
	reply: Reply,
) => Promise<Reply>;

export type Middleware = <Request extends FastifyRequest = FastifyRequest, Reply extends FastifyReply = FastifyReply>(
	request: Request,
	reply: Reply,
) => unknown;

export type ErrorHandler = <Request extends FastifyRequest = FastifyRequest, Reply extends FastifyReply = FastifyReply>(
	error: Error,
	request: Request,
	reply: Reply,
) => unknown;

export type Routes = <Server extends FastifyInstance = FastifyInstance>(server: Server) => unknown;
