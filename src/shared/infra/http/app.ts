import * as dotenv from 'dotenv';
dotenv.config();
import { resolve } from 'node:path';
import 'express-async-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from '@shared/infra/http/routes/index';
import swaggerUi from 'swagger-ui-express';
import '@shared/container';
import { errorHandler } from '@shared/infra/http/middlewares/errorHandler';
import docs from '@shared/docs';
import { resolveLoggerProvider } from '@shared/container/providers/logger';
import { MongoRepository } from '../mongo/Mongo.repository';
import corsConfig from '@config/cors';

const app = express();

MongoRepository.Instance.start();
const logger = resolveLoggerProvider();

app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(docs));
app.use('/files', express.static(resolve(__dirname, '..', '..', '..', '..', 'tmp', 'drink')));
app.use(logger.getHttpMiddleware());
app.use(routes);
app.use(errorHandler);

export { app };
