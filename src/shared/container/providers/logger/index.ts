import { PinoLoggerProvider } from './implementations/PinoLogger.provider';

const loggerProvider = new PinoLoggerProvider();
export const resolveLoggerProvider = () => loggerProvider;
