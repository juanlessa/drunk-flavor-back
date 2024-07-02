import { ICreateUser, IUpdateUser } from "@/modules/accounts/dtos/user.dtos";
import { IUser } from "@/modules/accounts/entities/user.entity";

interface IUsersRepository {
  create(data: ICreateUser): Promise<IUser>;
  update(data: IUpdateUser): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  delete(id: string): Promise<IUser>;
}

export { IUsersRepository };
