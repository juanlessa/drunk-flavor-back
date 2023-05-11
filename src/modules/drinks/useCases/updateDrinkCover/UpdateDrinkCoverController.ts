import { Request, Response } from "express";
import { container } from "tsyringe";
import { UpdateDrinkCoverService } from "./UpdateDrinkCoverService";


class UpdateDrinkCoverController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { id } = request.params;
        console.log("req file");
        console.log(request.file);
        console.log(request.params);
        
        
        const coverFile = request.file.filename;

        const updateDrinkCoverService = container.resolve(
            UpdateDrinkCoverService
        );

        await updateDrinkCoverService.execute({ drinkId: id, coverFile: coverFile });

        return response.status(204).send();
    }
}

export { UpdateDrinkCoverController };