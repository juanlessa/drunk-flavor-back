import { inject, injectable } from "tsyringe";
import {IIngredientsRepository} from '@modules/drinks/repositories/IIngredientsRepository'
import AppError from "@shared/errors/AppError";
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";


@injectable()
class DeleteDrinkService {
    constructor(

        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
    ) {}
    async execute(id: string): Promise<void> {
        const drinkExists = await this.drinksRepository.findById(id);

        if (!drinkExists) {
           throw new AppError("Drink does not exist");
        }
        
        await this.drinksRepository.delete(id)

    }
}

export { DeleteDrinkService };