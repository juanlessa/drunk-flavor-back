export type AppErrorOptions = ErrorOptions & {
	path?: string;
};

export type ErrorResponse = {
	statusCode: number;
	message: string;
};
