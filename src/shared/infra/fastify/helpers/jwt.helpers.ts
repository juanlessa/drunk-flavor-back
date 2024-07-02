import type { FastifyJWTOptions } from "@fastify/jwt";

export const addSubjectToJwtOptions = (
  subject: string,
  jwtOptions: FastifyJWTOptions
): FastifyJWTOptions => {
  return {
    ...jwtOptions,
    sign: { ...jwtOptions.sign, sub: subject },
  };
};
