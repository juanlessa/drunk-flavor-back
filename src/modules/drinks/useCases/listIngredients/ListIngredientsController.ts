import {  Prisma } from '@prisma/client'
import { Request, Response } from "express";
import { container } from "tsyringe";
import { ListIngredientsService } from "./ListIngredientsService";

type Ingredient = Prisma.IngredientCreateInput


class ListIngredientsController {
    async handle(request: Request, response: Response): Promise<Response> {
        
        const listIngredientsService = container.resolve(ListIngredientsService);

        const ingredients = await listIngredientsService.execute();

        return response.json(ingredients);
    }
}

export { ListIngredientsController };