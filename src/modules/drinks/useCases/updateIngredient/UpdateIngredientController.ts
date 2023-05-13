import { Request, Response } from "express";
import { container } from "tsyringe";
import { UpdateIngredientService } from "./UpdateIngredientService";

interface IRequest {
    id: string;
    name: string;
    category: string,
    isAlcoholic: boolean,
    unity: string,
    colorTheme: string
}


class UpdateIngredientController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { id, name, category, isAlcoholic, unity, colorTheme }:IRequest = request.body;
        

        const updateIngredientService = container.resolve(
            UpdateIngredientService
        );

        await updateIngredientService.execute(
            { id, name, category, isAlcoholic, unity, colorTheme }
        );

        return response.status(204).send();
    }
}

export { UpdateIngredientController };