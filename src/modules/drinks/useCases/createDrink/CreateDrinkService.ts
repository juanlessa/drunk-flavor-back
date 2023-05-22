import { inject, injectable } from "tsyringe";
import { SafeParseError, z } from 'zod';
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import AppError from '@shared/errors/AppError';


interface IResponse {
    id: string
}

const createDrinkSchema = z.object({
    name: z.string().trim().toLowerCase().min(1, {message: "Drink must have a name."}).transform((val) => val.charAt(0).toLocaleUpperCase + val.slice(1)),
    method: z.string().trim().min(1, {message: "Drink must have a method."}),
    ingredients: z.array( z.object({
        ingredientId: z.string().min(1),
        quantity: z.number().gt(0)
    })).min(1, {message: "Drink must have ingredients."})
})
type ICreateDrink = z.infer<typeof createDrinkSchema>

@injectable()
class CreateDrinkService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository,
    ) {}

    async execute(data: ICreateDrink): Promise<IResponse> {
        
        const result = createDrinkSchema.safeParse(data)
        if(!result.success){
            const { error } = result as SafeParseError<ICreateDrink>; 
            throw new AppError(error.issues[0].message)
        }
        
        const { name, method, ingredients } = result.data

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
