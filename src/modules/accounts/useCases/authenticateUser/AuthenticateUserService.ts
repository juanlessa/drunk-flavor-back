import { inject, injectable } from "tsyringe";
import { SafeParseError, z } from "zod";
import auth from "@config/auth";
import AppError from "@errors/AppError";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IUsersTokensRepository } from "@modules/accounts/repositories/IUsersTokensRepository";
import { IDateProvider } from "@shared/container/providers/dateProvider/IDateProvider";
import { IJwtProvider } from "@shared/container/providers/jwt/IJwtProvider";
import { IEncryptionProvider } from "@shared/container/providers/encryption/IEncryptionProvider";

const requestSchema = z.object({
    email: z.string({required_error: "Email is required."}).email({message: "Email invalid."}),
    password: z.string({required_error: "Password is required."}).min(8, {message: "Password must have a minimum of 8 characters"})
}) 
type IRequest = z.infer<typeof requestSchema>

interface IResponse {
    user: {
        name: string;
        email: string;
    };
    token: {
        token: string;
        expires: Date;
    };
    refresh_token: {
        token: string;
        expires: Date;
    }
}

@injectable()
class AuthenticateUserService {
    constructor(
        @inject("UsersRepository")
        private usersRepository: IUsersRepository,
        @inject("UsersTokensRepository")
        private usersTokensRepository: IUsersTokensRepository,
        @inject("DayjsDateProvider")
        private dateProvider: IDateProvider,
        @inject("JsonwebtokenProvider")
        private jwtProvider: IJwtProvider,
        @inject("BcryptProvider")
        private bcryptProvider: IEncryptionProvider
    ) {}
    async execute(data: IRequest): Promise<IResponse> {

        const result = requestSchema.safeParse(data)
        if(!result.success){
            const { error } = result as SafeParseError<IRequest>;
            throw new AppError(error.issues[0].message)
        }
        const { email, password } = result.data

        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new AppError("Email or password incorrect!");
        }

        const passwordMatch = await this.bcryptProvider.compare(password, user.password);
        if (!passwordMatch) {
            throw new AppError("Email or password incorrect!");
        }

        // create token
        const token = this.jwtProvider.createToken({ userId: user.id })
        const token_expires_date = this.dateProvider.addHours(
            auth.expires_token_hours
        );

        // create refresh token
        const refresh_token = this.jwtProvider.createRefreshToken({
            userEmail: email,
            userId: user.id 
        })
        const refresh_token_expires_date = this.dateProvider.addDays(
            auth.expires_refresh_token_days
        );

        await this.usersTokensRepository.create({
            expires_date: refresh_token_expires_date,
            refresh_token: refresh_token,
            user_id: user.id,
        });

        return {
            user: {
                name: user.name,
                email: user.email,
            },
            token: {
                token: token,
                expires: token_expires_date
            },
            refresh_token:{
                token: refresh_token,
                expires: refresh_token_expires_date
            },
        };
    }
}

export { AuthenticateUserService };