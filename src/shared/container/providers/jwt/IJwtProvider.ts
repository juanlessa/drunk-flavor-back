import { ICreateRefreshToken, ICreateToken } from "@modules/accounts/dtos/UsersTokensDTO";

interface IJwtProvider {
    createToken(data: ICreateToken): string;
    createRefreshToken(data: ICreateRefreshToken): string;
}

export { IJwtProvider };