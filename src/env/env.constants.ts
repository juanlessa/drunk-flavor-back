import {
	ApiEnv,
	ApiEnvEnum,
	LogLevel,
	LogLevelEnum,
	MongoPersistenceMode,
	MongoPersistenceModeEnum,
	NodeEnv,
	NodeEnvEnum,
	StorageType,
	StorageTypeEnum,
} from './env.types';

export const nodeEnvOptions = Object.keys(NodeEnvEnum) as [NodeEnv, ...NodeEnv[]];
export const apiEnvOptions = Object.keys(ApiEnvEnum) as [ApiEnv, ...ApiEnv[]];
export const logLevelOptions = Object.keys(LogLevelEnum) as [LogLevel, ...LogLevel[]];
export const mongoPersistenceModeOptions = Object.keys(MongoPersistenceModeEnum) as [
	MongoPersistenceMode,
	...MongoPersistenceMode[],
];
export const storageTypeOptions = Object.keys(StorageTypeEnum) as [StorageType, ...StorageType[]];
