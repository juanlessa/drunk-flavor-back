import { IUser } from '@modules/accounts/dtos/UsersDTO';

interface IUsersRepository {
    create(data: IUser): Promise<IUser>;
    update(data: IUser): Promise<IUser>;
    findById(id: string): Promise<IUser>;
    findByEmail(email: string): Promise<IUser>
}

export { IUsersRepository };