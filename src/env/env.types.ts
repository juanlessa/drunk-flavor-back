export enum NodeEnvEnum {
	development = 'development',
	production = 'production',
	testing = 'testing',
	e2e = 'e2e',
}
export enum ApiEnvEnum {
	development = 'development',
	staging = 'staging',
	production = 'production',
}
export enum LogLevelEnum {
	silent = 'silent',
	trace = 'trace',
	debug = 'debug',
	info = 'info',
	warn = 'warn',
	error = 'error',
	fatal = 'fatal',
}
export enum MongoPersistenceModeEnum {
	inMemory = 'inMemory',
	inDisk = 'inDisk',
}
export enum StorageTypeEnum {
	local = 'local',
	s3 = 's3',
}

export type NodeEnv = keyof typeof NodeEnvEnum;
export type ApiEnv = keyof typeof ApiEnvEnum;
export type LogLevel = keyof typeof LogLevelEnum;
export type MongoPersistenceMode = keyof typeof MongoPersistenceModeEnum;
export type StorageType = keyof typeof StorageTypeEnum;
