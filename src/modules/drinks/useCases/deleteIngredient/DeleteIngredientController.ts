import { Request, Response } from "express";
import { container } from "tsyringe";
import { DeleteIngredientService } from "./DeleteIngredientService";

interface IRequest {
    id: string;
}


class DeleteIngredientController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { id }:IRequest = request.body;
        

        const deleteIngredientService = container.resolve(
            DeleteIngredientService
        );

        await deleteIngredientService.execute({ id });

        return response.status(204).send();
    }
}

export { DeleteIngredientController };