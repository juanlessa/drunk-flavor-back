import * as dotenv from 'dotenv';
dotenv.config();
import { resolve } from 'path';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import routes from '@routes/index';
import swaggerUi from 'swagger-ui-express';
import '@shared/container';
import { errorHandler } from '@middlewares/errorHandler';
import { initiateMongo } from '@shared/infra/mongo';
import docs from '@shared/docs';
import { resolveLoggerProvider } from '@shared/container/providers/logger';

const app = express();

initiateMongo();
const logger = resolveLoggerProvider();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(docs));
app.use('/files', express.static(resolve(__dirname, '..', '..', '..', '..', 'tmp', 'drink')));
app.use(logger.getHttpMiddleware());
app.use(routes);
app.use(errorHandler);

export { app };
