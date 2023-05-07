import {  Prisma } from '@prisma/client'
import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateDrinkService } from "./CreateDrinkService";

type Drink = Prisma.DrinkCreateInput


class CreateDrinkController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { name, method }:Drink = request.body;

   
        const createDrinkService = container.resolve(CreateDrinkService);

        const drink = await createDrinkService.execute({
            name, method
        });

        return response.status(201).json(drink);
    }
}

export { CreateDrinkController };