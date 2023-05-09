import { Prisma } from '@prisma/client'
import { inject, injectable } from "tsyringe";
import { z } from 'zod';
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import AppError from '@shared/errors/AppError';


interface IResponse{
    id: string
}

const drinkSchema = z.object({
    name: z.string(),
    method: z.string(),
    ingredients: z.array( z.object({
        ingredientId: z.string(),
        quantity: z.number()
    }))
})
type Drink = z.infer<typeof drinkSchema>


@injectable()
class CreateDrinkService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository,
    ) {}

    async execute(data:Drink): Promise<IResponse> {
        
        const {name, method, ingredients } = drinkSchema.parse(data)

        const drinkALreadyExists = await this.drinksRepository.findByName(name);        
        if (drinkALreadyExists) {
            throw new AppError("Drink already exists!");            
        }
        
        const ingredientsExists = await this.ingredientsRepository.findByIdList(ingredients.map(i => i.ingredientId))
        if(ingredientsExists.length !== ingredients.length){
            throw new AppError("Unable to create the drink, some ingredients don't exist!");
        }

        const ingredientsFormat = ingredients.map((ing)=>{
            return {
                ingredientId: ing.ingredientId,
                quantity: ing.quantity
            }
        })
        const drink = await this.drinksRepository.create({ name, method, ingredients: ingredientsFormat });

        return { id: drink.id };
    }
}

export { CreateDrinkService };
