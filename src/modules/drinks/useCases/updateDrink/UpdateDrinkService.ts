import { inject, injectable } from "tsyringe";
import {IDrinksRepository} from '@modules/drinks/repositories/IDrinksRepository'
import AppError from "@shared/errors/AppError";
import { IDrink } from "@modules/drinks/dtos/DrinksDTO";
import { IIngredientsRepository } from "@modules/drinks/repositories/IIngredientsRepository";


@injectable()
class UpdateDrinkService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository,
    ) {}
    async execute({ id, name, method, ingredients}: IDrink): Promise<void> {
        const drink = await this.drinksRepository.findById(id);
        if(!drink) {
            throw new AppError("Drink does not exit")
        }

        const ingredientsExists = await this.ingredientsRepository.findByIdList(ingredients.map(i => i.ingredientId))
        if(ingredientsExists.length !== ingredients.length){
            throw new AppError("Unable to update the drink, some ingredients don't exist!");
        }
        
        drink.name = name
        drink.method = method
        drink.ingredients = ingredients

        await this.drinksRepository.update(drink)
    }
}

export { UpdateDrinkService };