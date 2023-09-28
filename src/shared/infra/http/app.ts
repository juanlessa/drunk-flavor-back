import { resolve } from 'path';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import routes from '@routes/index';
import swaggerFile from '../../../swagger.json';
import swaggerUi from 'swagger-ui-express';
import '@shared/container';
import { errorHandler } from '@errors/errorHandler';
import { initiateMongo } from '@shared/infra/database/mongo';

dotenv.config();

const app = express();

initiateMongo();
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/files', express.static(resolve(__dirname, '..', '..', '..', '..', 'tmp', 'drink')));
app.use(routes);
app.use(errorHandler);

export { app };
