import { inject, injectable } from "tsyringe";
import { verify, sign } from "jsonwebtoken";
import { IUsersTokensRepository } from "@modules/accounts/repositories/IUsersTokensRepository";
import auth from "@config/auth";
import AppError from "@errors/AppError";
import { IDateProvider } from "@shared/container/providers/dateProvider/IDateProvider";

interface IPayload {
    sub: string;
    email: string;
}

interface ITokenResponse {
    token: string;
    expires: Date;
}

@injectable()
class RefreshTokenService {
    constructor(
        @inject("UsersTokensRepository")
        private usersTokensRepository: IUsersTokensRepository,
        @inject("DayjsDateProvider")
        private dateProvider: IDateProvider
    ) {}

    async execute(token: string): Promise<ITokenResponse> {
        let email = "";
        let user_id = "";

        try {
            const decode = verify(token, auth.secret_refresh_token) as IPayload;

            email = decode.email;
            user_id = decode.sub;
        } catch {
            throw new AppError("Invalid token!", 401);
        }

        const userToken =
            await this.usersTokensRepository.findByUserIdAndRefreshToken(
                user_id,
                token
            );

        if (!userToken) {
            throw new AppError("Refresh Token does not exists!");
        }


        // create token
        const newToken = sign({}, auth.secret_token, {
            subject: user_id,
            expiresIn: auth.expires_in_token,
        });
        const new_token_expires_date = this.dateProvider.addMinutes(
            1
        );

        return {
            token: newToken,
            expires: new_token_expires_date
        };
    }
}

export { RefreshTokenService };