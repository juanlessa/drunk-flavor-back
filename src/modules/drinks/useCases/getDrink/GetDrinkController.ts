import { Request, Response } from "express";
import { container } from "tsyringe";
import { GetDrinkService } from "./GetDrinkService";



class GetDrinkController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { id } = request.params;

        const getDrinkService = container.resolve(GetDrinkService);
        


        const drink = await getDrinkService.execute({ id });

        return response.json(drink);
    }
}

export { GetDrinkController };