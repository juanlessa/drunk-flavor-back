import type { LogLevel } from "@/shared/logger";

export enum NodeEnvEnum {
  development = "development",
  testing = "testing",
  "e2e-testing" = "e2e-testing",
  production = "production",
}
export enum ApiEnvEnum {
  development = "development",
  staging = "staging",
  production = "production",
}

export enum StorageTypeEnum {
  local = "local",
  s3 = "s3",
}

export type NodeEnv = keyof typeof NodeEnvEnum;
export type ApiEnv = keyof typeof ApiEnvEnum;
export type StorageType = keyof typeof StorageTypeEnum;

export type EnvType = {
  // Environment
  NODE_ENV: NodeEnv;
  // API
  API_ENV: ApiEnv;
  API_HOST: string;
  API_PORT: number;
  // Logger
  LOG_ENABLED: boolean;
  LOG_LEVEL: LogLevel;
  // Auth
  COOKIE_SECRET: string;
  SESSION_SECRET: string;
  TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN_SECONDS: number;
  REFRESH_TOKEN_EXPIRES_IN_SECONDS: number;
  // Mongo
  MONGO_USERNAME: string;
  MONGO_PASSWORD: string;
  MONGO_DATABASE: string;
  MONGO_HOST: string;
  MONGO_PORT: number;
  MONGO_PARAMS: string;
  MONGO_MAX_POOL_SIZE: number;
  MONGO_SERVER_SELECTION_TIMEOUT_MS: number;
  MONGO_CONNECT_TIMEOUT_MS: number;
  // Storage type
  STORAGE_TYPE: StorageType;
  // S3
  AWS_S3_BUCKET_NAME?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_DEFAULT_REGION?: string;
};
