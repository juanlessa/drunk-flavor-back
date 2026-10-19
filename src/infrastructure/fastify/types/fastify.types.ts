import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export type Request = FastifyRequest;
export type Reply = FastifyReply;
export type Error = FastifyError;
export type Server = FastifyInstance;

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
) => Promise<unknown>;

export type ErrorHandler = <TError = unknown>(error: TError, request: Request, reply: Reply) => void;

export type Routes = <S extends Server = Server>(server: S) => unknown;

export type PreHandler = (request: Request, reply: Reply) => Promise<void>;
export type OnError = (request: Request, reply: Reply, error: FastifyError) => Promise<void>;
