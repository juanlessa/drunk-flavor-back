import { resolve } from 'path';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from '@routes/index';
import '@shared/container';
import AppError from '@shared/errors/AppError';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); //enable use of JSON
app.use('/files', express.static(resolve(__dirname, '..', 'tmp', 'drink')));
app.use(routes);

//errors middleware
app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
	if (err instanceof AppError) {
		return response.status(err.statusCode).json({
			status: 'error',
			message: err.message
		});
	}
	console.error(err);

	return response.status(500).json({
		status: 'error',
		message: 'Internal server error.'
	});
});

const serverPort = Number(process.env.APP_PORT);
app.listen(serverPort, () => {
	console.log(`🚀 Server started on port ${serverPort}`);
});
