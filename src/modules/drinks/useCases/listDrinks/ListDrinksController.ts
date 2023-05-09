import { Request, Response } from "express";
import { container } from "tsyringe";
import { ListDrinksService } from "./ListDrinksService";

class ListDrinksController {
    async handle(request: Request, response: Response): Promise<Response> {
        
        const listDrinksService = container.resolve(ListDrinksService);

        const drinks = await listDrinksService.execute();

        return response.json(drinks);
    }
}

export { ListDrinksController };