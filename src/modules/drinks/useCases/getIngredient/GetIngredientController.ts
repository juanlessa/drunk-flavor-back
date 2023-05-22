import { Request, Response } from "express";
import { container } from "tsyringe";
import { GetIngredientService } from "./GetIngredientService";


class GetIngredientController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { id } = request.params

        const getIngredientService = container.resolve(GetIngredientService);
        
        
        const ingredient = await getIngredientService.execute({ id });

        return response.json(ingredient);
    }
}

export { GetIngredientController };