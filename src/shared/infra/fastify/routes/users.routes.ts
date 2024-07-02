import { CreateUserController } from "@/modules/accounts/useCases/createUser/CreateUser.controller";
import { createUserSchema } from "@/modules/accounts/useCases/createUser/createUser.schema";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { pluginGenerator } from "../helpers/fastify.helpers";
import { Routes } from "../types/fastify.types";
import { verifyAndRenewToken } from "../middlewares/verifyAndRenewToken";

const routes: Routes = (server) => {
  server
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/users",
      { schema: { body: createUserSchema }, onRequest: [verifyAndRenewToken] },
      CreateUserController
    );
};

export const usersRoutes = pluginGenerator(routes);
