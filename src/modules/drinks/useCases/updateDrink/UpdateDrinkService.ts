import { inject, injectable } from "tsyringe";
import {IDrinksRepository} from '@modules/drinks/repositories/IDrinksRepository'
import AppError from "@shared/errors/AppError";
import { IDrink } from "@modules/drinks/dtos/DrinksDTO";
import { IIngredientsRepository } from "@modules/drinks/repositories/IIngredientsRepository";
import { SafeParseError, z } from 'zod';

const updateDrinkSchema = z.object({
    id: z.string().length(24, {message:"Drink does not exist!"}),
    name: z.string().trim().toLowerCase().min(1, {message: "Drink must have a name."}).transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`),
    method: z.string().trim().min(1, {message: "Drink must have a method."}),
    ingredients: z.array( z.object({
        ingredientId: z.string().length(24, {message:"Some ingredients don't exist!"}),
        quantity: z.number().gt(0)
    })).min(1, {message: "Drink must have ingredients."})
})
type IUpdateDrink = z.infer<typeof updateDrinkSchema>

@injectable()
class UpdateDrinkService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository,
    ) {}
    async execute(data: IDrink): Promise<void> {
         
        const result = updateDrinkSchema.safeParse(data)
        if(!result.success){
            const { error } = result as SafeParseError<IUpdateDrink>; 
            throw new AppError(error.issues[0].message)
        }
        
        const { id, name, method, ingredients } = result.data;        
        
        
        const drink = await this.drinksRepository.findById(id);
        if(!drink) {
            throw new AppError("Drink does not exit!")
        }

        const drinkNameALreadyExists = await this.drinksRepository.findByName(name);        
        if (drinkNameALreadyExists && (drinkNameALreadyExists.id !== drink.id)) {
            throw new AppError("Drink name already exists!");            
        }


        const ingredientsExists = await this.ingredientsRepository.findByIdList(ingredients.map(i => i.ingredientId))
        if(ingredientsExists.length !== ingredients.length){
            throw new AppError("Some ingredients don't exist!");
        }
        
        
        drink.name = name
        drink.method = method
        drink.ingredients = ingredients.map((ing) => ({ingredientId: ing.ingredientId, quantity: ing.quantity}));

        await this.drinksRepository.update(drink)
    }
}

export { UpdateDrinkService };