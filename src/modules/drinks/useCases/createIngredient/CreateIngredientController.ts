import {  Prisma } from '@prisma/client'
import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateIngredientService } from "./CreateIngredientService";

type Ingredient = Prisma.IngredientCreateInput


class CreateIngredientController {
    async handle(request: Request, response: Response): Promise<Response> {
        const {name,        unity,      category,      isAlcoholic,     colorTheme
        }:Ingredient = request.body;

   
        const createIngredientService = container.resolve(CreateIngredientService);

        const ingredient = await createIngredientService.execute({
            name,                    
            unity,      
            category,      
            isAlcoholic,     
            colorTheme
        });

        return response.status(201).json(ingredient);
    }
}

export { CreateIngredientController };