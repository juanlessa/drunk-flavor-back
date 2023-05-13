import { inject, injectable } from "tsyringe";
import {IDrinksRepository} from '@modules/drinks/repositories/IDrinksRepository'
import { deleteFile } from "@utils/file";
import AppError from "@shared/errors/AppError";

interface IRequest {
    drinkId: string;
    coverFile: string;
}

@injectable()
class UpdateDrinkCoverService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository
    ) {}
    async execute({ drinkId, coverFile }: IRequest): Promise<void> {
        const drink = await this.drinksRepository.findById(drinkId);
        if(!drink) {
            throw new AppError("Drink does not exit")
        }


        if (drink.cover) {
            await deleteFile(`./tmp/drink/${drink.cover}`);
        }
        
        drink.cover = coverFile;
        console.log(drink);


        
        await this.drinksRepository.update(drink)
    }
}

export { UpdateDrinkCoverService };