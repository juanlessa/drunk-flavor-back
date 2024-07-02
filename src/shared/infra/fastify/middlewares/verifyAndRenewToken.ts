import { NotFoundError } from "@/shared/error/error.lib";
import {
  AUTH_COOKIE,
  AUTH_COOKIE_OPTIONS,
} from "../constants/cookie.constants";
import { AUTH_SESSION } from "../constants/session.constants";
import { logger } from "@/shared/logger";
import { Middleware } from "../types/fastify.types";
import {
  instanceOfFastifyJwtError,
  instanceOfJwtAuthorizationTokenExpiredError,
} from "../errors/fastifyJwtError";
import { signOut } from "./signOut";

export const verifyAndRenewToken: Middleware = async (request, reply) => {
  try {
    await request.jwtVerify();
    return;
  } catch (error) {
    if (!instanceOfJwtAuthorizationTokenExpiredError(error)) {
      void signOut(request, reply);
      throw error;
    }
  }

  console.log("------------------------");
  console.log("vou refresh");
  console.log("------------------------");

  const session = request.session.get(AUTH_SESSION);

  if (!session) {
    logger.info(
      `fastify.verifyAndRenewToken.3: session not found for renew token, for ${request.routeOptions.url}`
    );
    throw new NotFoundError("invalid resource", {
      cause: "no session found",
      path: "fastify.verifyAndRenewToken.3",
    });
  }

  const { refreshToken, userId } = session;

  try {
    request.server.jwt.verify(refreshToken);
  } catch (error) {
    if (instanceOfFastifyJwtError(error)) {
      void signOut(request, reply);
    }
    throw error;
  }

  const newAccessToken = await reply.jwtSign({}, { sign: { sub: userId } });

  reply.setCookie(AUTH_COOKIE, newAccessToken, AUTH_COOKIE_OPTIONS);
};
