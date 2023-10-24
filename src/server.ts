import { app } from '@shared/infra/http/app';
import { container } from 'tsyringe';
import { PinoLogger } from '@shared/container/providers/logger/implementations/PinoLogger.provider';
import serverConfig from '@config/api';

const logger = container.resolve(PinoLogger);

app.listen(serverConfig.port, () => {
	logger.info(`🚀 Server started on port ${serverConfig.port}`);
});
