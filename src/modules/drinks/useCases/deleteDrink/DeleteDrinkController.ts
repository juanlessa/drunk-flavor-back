import { Request, Response } from "express";
import { container } from "tsyringe";
import { DeleteDrinkService } from "./DeleteDrinkService";

interface IRequest {
    id: string;
}


class DeleteDrinkController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { id }:IRequest = request.body;
        

        const deleteDrinkService = container.resolve(
            DeleteDrinkService
        );

        await deleteDrinkService.execute(id);

        return response.status(204).send();
    }
}

export { DeleteDrinkController };