import { Request, Response } from "express";
import { container } from "tsyringe";
import { UpdateDrinkThumbnailService } from "./UpdateDrinkThumbnailService";


class UpdateDrinkThumbnailController {
    async handle(request: Request, response: Response): Promise<Response> {
        const { id } = request.params;
                
        const thumbnailFile = request.file.filename;

        const updateDrinkThumbnailService = container.resolve(
            UpdateDrinkThumbnailService
        );

        await updateDrinkThumbnailService.execute({ drinkId: id, thumbnailFile: thumbnailFile });

        return response.status(204).send();
    }
}

export { UpdateDrinkThumbnailController };