import { resolve } from 'path';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import routes from '@routes/index';
import swaggerUi from 'swagger-ui-express';
import '@shared/container';
import { errorHandler } from '@middlewares/errorHandler';
import { initiateMongo } from '@shared/infra/mongo';
import docs from '@shared/docs';

dotenv.config();

const app = express();

initiateMongo();
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(docs));
app.use('/files', express.static(resolve(__dirname, '..', '..', '..', '..', 'tmp', 'drink')));
app.use(routes);
app.use(errorHandler);

export { app };
