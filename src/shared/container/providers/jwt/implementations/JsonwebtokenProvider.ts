import { sign } from "jsonwebtoken";
import auth from "@config/auth";
import { IJwtProvider } from "../IJwtProvider";
import { ICreateRefreshToken, ICreateToken } from '@modules/accounts/dtos/UsersTokensDTO'

class JsonwebtokenProvider implements IJwtProvider {

    createToken({ userId }: ICreateToken): string {
        const token = sign({}, auth.secret_token, {
            subject: userId,
            expiresIn: auth.expires_in_token,
        });
        return token
    }

    createRefreshToken({ userEmail, userId }: ICreateRefreshToken): string {
        const refresh_token = sign({ userEmail }, auth.secret_refresh_token, {
            subject: userId,
            expiresIn: auth.expires_in_refresh_token,
        });
        return refresh_token;
    }

}

export { JsonwebtokenProvider }