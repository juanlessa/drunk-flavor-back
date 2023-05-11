import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateUserService } from "./CreateUserService";

interface IRequest {
    name: string,
    email: string,
    password: string
}

class CreateUserController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { name, email, password }:IRequest = request.body;
        const createUserService = container.resolve(CreateUserService);

        await createUserService.execute({
            name,
            email,
            password
        });

        return response.status(201).send();
    }
}

export { CreateUserController };