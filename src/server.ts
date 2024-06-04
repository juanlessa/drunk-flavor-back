import { app } from '@shared/infra/http/app';
import '@/env';
import { apiConfig } from '@config/api';
import { resolveLoggerProvider } from '@shared/container/providers/logger';

const logger = resolveLoggerProvider();

app.listen(apiConfig.PORT, () => {
	logger.info(`🚀 Server started on port ${apiConfig.PORT}`);
});
