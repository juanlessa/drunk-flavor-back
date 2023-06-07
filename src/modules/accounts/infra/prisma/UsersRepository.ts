import { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@shared/container/providers/prismaProvider'
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IUser } from '@modules/accounts/dtos/UsersDTO';


class UsersRepository implements IUsersRepository {
    private prismaClient: PrismaClient;

    constructor() {
        this.prismaClient = getPrismaClient();
    }


    async create(data: IUser): Promise<IUser> {
        const user = await this.prismaClient.user.create({data})
        return user;
    }
    async update(data: IUser): Promise<IUser> {
        const user = await this.prismaClient.user.update({
            where: { id: data.id },
            data: {
                name: data.name,
                email: data.email,
                password: data.password
            }
        })
        return user;
    }


    async findById(id: string): Promise<IUser> {
        const results = await this.prismaClient.user.findUnique({where: { id }})
        return results
    }
    async findByEmail(email: string): Promise<IUser> {
        const results = await this.prismaClient.user.findUnique({where: { email }})
        return results
    }

}


export { UsersRepository };