import { inject, injectable } from "tsyringe";
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";
import {IDrinkResponse} from '@modules/drinks/dtos/DrinksDTO'
import AppError from "@shared/errors/AppError";


@injectable()
class GetDrinkService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
    ) {}

    async execute(id: string): Promise<IDrinkResponse> {    
        const drinks = await this.drinksRepository.findByIdWithIngredientsDetails(id);  
        if(drinks.length !== 1){
            throw new AppError("Drink not found!");            
        }
        
        return drinks[0];
    }
}

export { GetDrinkService };