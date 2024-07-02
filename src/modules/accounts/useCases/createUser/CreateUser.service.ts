import { ICreateUser } from "@/modules/accounts/dtos/user.dtos";
import { IUsersRepository } from "@/modules/accounts/repositories/IUsers.repository";
import { IEncryptionProvider } from "@/shared/providers/encryption/IEncryption.provider";
import { BadRequestError } from "@/shared/error/error.lib";
import { USER_MESSAGES } from "@/shared/constants/ResponseMessages";

export class CreateUserService {
  constructor(
    private usersRepository: IUsersRepository,
    private encryptionProvider: IEncryptionProvider
  ) {}

  async execute({ name, surname, email, password, role }: ICreateUser) {
    const userAlreadyExists = await this.usersRepository.findByEmail(email);
    if (userAlreadyExists) {
      throw new BadRequestError(USER_MESSAGES.alreadyExist.message, {
        path: "CreateUser.service",
      });
    }

    const passwordHash = await this.encryptionProvider.hash(password);

    await this.usersRepository.create({
      name,
      password: passwordHash,
      surname,
      email,
      role,
    });
  }
}
