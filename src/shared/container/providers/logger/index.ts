import { container } from 'tsyringe';
import { ILoggerProvider } from './ILogger.provider';
import { PinoLoggerProvider } from './implementations/PinoLogger.provider';

container.registerSingleton<ILoggerProvider>('LoggerProvider', PinoLoggerProvider);

const loggerProvider = new PinoLoggerProvider();

export const resolveLoggerProvider = () => loggerProvider;
