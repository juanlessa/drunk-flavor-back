import { env } from "@/env";
import { NodeEnvEnum } from "@/env/env.types";

const EnvToLogger = {
  [NodeEnvEnum.development]: {
    level: env.LOG_LEVEL,
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        colorize: true,
      },
    },
  },
  [NodeEnvEnum.production]: {
    level: env.LOG_LEVEL,
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        colorize: true,
      },
    },
  },
  test: false,
};

const environment = (env.NODE_ENV ?? "production") as keyof typeof EnvToLogger;

export const FASTIFY_LOGGER_OPTIONS = EnvToLogger[environment];
