import { env } from "@/env";
import type { FastifyJWTOptions } from "@fastify/jwt";

export const jwtConfig = {
  ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN: env.REFRESH_TOKEN_EXPIRES_IN,
};
