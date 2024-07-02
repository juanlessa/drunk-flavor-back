import { authConfig } from "@/config/auth";
import {
  IAuthenticateUser,
  IAuthenticateUserResponse,
} from "@/modules/accounts/dtos/authentication.dtos";
import { AUTHENTICATION_MESSAGES } from "@/shared/constants/ResponseMessages";
import { IUsersRepository } from "@/modules/accounts/repositories/IUsers.repository";
import { IEncryptionProvider } from "@/shared/providers/encryption/IEncryption.provider";
import { BadRequestError } from "@/shared/error/error.lib";

export class AuthenticateUserService {
  constructor(
    private usersRepository: IUsersRepository,
    private encryptionProvider: IEncryptionProvider
  ) {}

  async execute({
    email,
    password,
  }: IAuthenticateUser): Promise<IAuthenticateUserResponse> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestError(
        AUTHENTICATION_MESSAGES.invalidCredentials.message,
        {
          path: "AuthenticateUser.service",
          cause: "invalid email",
        }
      );
    }

    const passwordMatch = await this.encryptionProvider.compare(
      password,
      user.password
    );
    if (!passwordMatch) {
      throw new BadRequestError(
        AUTHENTICATION_MESSAGES.invalidCredentials.message,
        {
          path: "AuthenticateUser.service",
          cause: "invalid password",
        }
      );
    }

    return {
      user: {
        id: user._id.toString(),
      },
    };
  }
}
