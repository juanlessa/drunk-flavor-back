import { instanceToInstance } from "class-transformer";
import { IUserProfileResponse } from "@modules/accounts/dtos/UsersDTO";
import { Prisma } from "@prisma/client";


type User = Prisma.UserCreateInput

class UserMap {
    static toDTO({
        email,
        name,
        id,
    }: User): IUserProfileResponse {
        const user = instanceToInstance({
            email,
            name,
            id,
        });
        return user;
    }
}

export { UserMap };