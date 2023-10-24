import { container } from 'tsyringe';
import { ILogger } from './ILogger.provider';
import { PinoLogger } from './implementations/PinoLogger.provider';

container.registerSingleton<ILogger>('LoggerProvider', PinoLogger);
