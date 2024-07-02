export enum LogLevelEnum {
  silent = "silent",
  trace = "trace",
  debug = "debug",
  info = "info",
  warn = "warn",
  error = "error",
  fatal = "fatal",
}

export type LogLevel = keyof typeof LogLevelEnum;

type LogFunction = {
  <T extends object>(obj: T, msg?: string, ...args: unknown[]): void;
  (obj: unknown, msg?: string, ...args: unknown[]): void;
  <T extends object>(obj: T, ...args: unknown[]): void;
  (msg: string, ...args: unknown[]): void;
};

export type BaseLogger = {
  level?: LogLevel;
  fatal?: LogFunction;
  error: LogFunction;
  warn: LogFunction;
  info: LogFunction;
  debug: LogFunction;
  trace: LogFunction;
  silent?: LogFunction;
};
