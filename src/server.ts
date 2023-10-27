import { app } from '@shared/infra/http/app';
import serverConfig from '@config/api';
import { resolveLoggerProvider } from '@shared/container/providers/logger';

const logger = resolveLoggerProvider();

app.listen(serverConfig.port, () => {
	logger.info(`🚀 Server started on port ${serverConfig.port}`);
});
