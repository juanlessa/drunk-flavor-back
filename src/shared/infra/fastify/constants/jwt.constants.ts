import { env } from "@/env";
import { FastifyJWTOptions } from "@fastify/jwt";

export const TOKEN_OPTIONS = {
  secret: env.TOKEN_SECRET,
  sign: {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  },
} satisfies FastifyJWTOptions;
