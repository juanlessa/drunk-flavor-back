import { NextFunction, Request, Response } from 'express';

export type AppRequest = Request & {
	user: {
		id: string;
	};
	file?: Express.Multer.File & Express.MulterS3.File;
};
export type AppResponse = Response;
export type AppNextFunction = NextFunction;
