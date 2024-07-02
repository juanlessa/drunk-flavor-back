import { env } from "@/env";
import { FastifyJWTOptions } from "@fastify/jwt";
import { AUTH_COOKIE } from "./cookie.constants";

export const TOKEN_OPTIONS = {
  secret: env.TOKEN_SECRET,
  sign: {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  },
  cookie: {
    cookieName: AUTH_COOKIE,
    signed: true,
  },
} satisfies FastifyJWTOptions;
