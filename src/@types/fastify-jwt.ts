import "@fastify/jwt";
import "fastify";
import {
  VerifyPayloadType,
  SignPayloadType,
  FastifyJwtSignOptions,
  FastifyJwtVerifyOptions,
} from "@fastify/jwt";
import { DecodedToken } from "@/shared/infra/fastify/types/jwt.types";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
    };
  }
}

declare module "fastify" {
  interface FastifyRequest {
    jwtVerify<T extends VerifyPayloadType = DecodedToken>(
      options?: FastifyJwtVerifyOptions
    ): Promise<T>;

    sessionJwtVerify<T extends VerifyPayloadType = DecodedToken>(
      options?: FastifyJwtVerifyOptions
    ): Promise<T>;
  }
  interface FastifyReply {
    sessionJwtSign(
      payload: SignPayloadType,
      options?: FastifyJwtSignOptions
    ): Promise<string>;
  }
}
