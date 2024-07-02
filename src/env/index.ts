import "dotenv/config";
import {
  developmentEnvSchema,
  productionEnvSchema,
  testingEnvSchema,
  e2eTestingEnvSchema,
} from "./env.schema";
import { EnvType, NodeEnvEnum } from "./env.types";

let _env: EnvType;
const { NODE_ENV } = process.env;

if (NODE_ENV === NodeEnvEnum.production) {
  _env = productionEnvSchema.parse(process.env);
} else if (NODE_ENV === NodeEnvEnum.testing) {
  _env = testingEnvSchema.parse(process.env);
} else if (NODE_ENV === NodeEnvEnum["e2e-testing"]) {
  _env = e2eTestingEnvSchema.parse(process.env);
} else {
  _env = developmentEnvSchema.parse(process.env);
}

export const env = _env;
