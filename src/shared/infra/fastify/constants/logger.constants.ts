import { env } from "@/env";

const EnvToLogger = {
  development: {
    level: env.LOGGER_LEVEL,

    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        colorize: true,
      },
    },
  },
  production: {
    level: env.LOGGER_LEVEL,
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
