import "@fastify/secure-session";
import { AuthSessionData } from "@/shared/infra/fastify/types/session.types";
import { AUTH_SESSION } from "@/shared/infra/fastify/constants/session.constants";

declare module "@fastify/secure-session" {
  interface SessionData {
    [AUTH_SESSION]: AuthSessionData;
  }
}
