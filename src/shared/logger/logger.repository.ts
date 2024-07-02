import { env } from "@/env";
import { BaseLogger, LOG_LEVEL } from "./logger.types";

export class LoggerRepository {
  private static _instance: LoggerRepository;

  private constructor(
    private loggerInstance: BaseLogger = console,
    public readonly level = env.LOGGER_LEVEL as LOG_LEVEL
  ) {}

  static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public static setLogger<T>(newLogger: T) {
    LoggerRepository.Instance.loggerInstance = newLogger as BaseLogger;
  }

  public get logger() {
    return LoggerRepository.Instance.loggerInstance;
  }
}

export default LoggerRepository.Instance;
