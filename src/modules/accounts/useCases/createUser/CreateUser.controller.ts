import { resolveCreateUserService } from "@/modules/accounts/useCases/createUser/createUser.container";
import { HTTP_STATUS } from "@/shared/constants/httpStatus";
import { Controller } from "@/shared/infra/fastify/types/fastify.types";
import { CreateUserReqBody } from "./createUser.schema";

export const CreateUserController: Controller = async (request, response) => {
  const { name, surname, email, password, role } =
    request.body as CreateUserReqBody;

  const service = resolveCreateUserService();

  await service.execute({ name, email, surname, password, role });

  return response.status(HTTP_STATUS.created).send();
};
