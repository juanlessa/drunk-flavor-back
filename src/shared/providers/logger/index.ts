import { ILoggerProvider } from './ILogger.provider';
import { PinoLoggerProvider } from './implementations/PinoLogger.provider';

let logger: ILoggerProvider = new PinoLoggerProvider();

const setLogger = <T>(newLogger: T) => {
	logger = newLogger as ILoggerProvider;
};

export { logger, setLogger };
