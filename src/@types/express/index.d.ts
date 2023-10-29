declare namespace Express {
	export interface Request {
		user: {
			id: string;
		};
		file?: Express.Multer.File & Express.MulterS3.File;
	}
}
