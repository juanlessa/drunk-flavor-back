import { StorageEngine } from 'multer';

export type IUploadConfig = {
	storage: StorageEngine;
	limits: {
		fieldSize: number;
	};
};
