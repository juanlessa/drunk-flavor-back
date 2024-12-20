import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export type Request = FastifyRequest;
export type Reply = FastifyReply;

type RequestSchema = {
	Body: unknown;
	Querystring: unknown;
	Params: unknown;
};

export type Controller<
	Schemas extends Partial<RequestSchema> = RequestSchema,
	Request extends FastifyRequest = FastifyRequest<{
		Body: Schemas['Body'];
		Querystring: Schemas['Querystring'];
		Params: Schemas['Params'];
	}>,
	Reply extends FastifyReply = FastifyReply,
> = (request: Request, reply: Reply) => Promise<Reply>;

export type Middleware = <Request extends FastifyRequest = FastifyRequest, Reply extends FastifyReply = FastifyReply>(
	request: Request,
	reply: Reply,
) => unknown;

export type ErrorHandler = FastifyInstance['errorHandler'];

export type Routes = <Server extends FastifyInstance = FastifyInstance>(server: Server) => unknown;
