import { hash } from "bcrypt";
import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import AppError from "@shared/errors/AppError";
import { SafeParseError, z } from "zod";

const createUserSchema = z.object({
    name: z.string({required_error: "Name is required"}).trim().toLowerCase().min(1, {message: "User must have a name."}).transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`),
    email: z.string({required_error: "Email is required."}).email({message: "Email invalid."}),
    password: z.string({required_error: "Password is required."}).min(8, {message: "Password must have a minimum of 8 characters"})
})
type ICreateUser = z.infer<typeof createUserSchema>

@injectable()
class CreateUserService {
    constructor(
        @inject("UsersRepository")
        private usersRepository: IUsersRepository
    ) {}
    async execute(data: ICreateUser) {

        const result = createUserSchema.safeParse(data)
        if(!result.success){
            const { error } = result as SafeParseError<ICreateUser>;
            throw new AppError(error.issues[0].message)
        }
        const { name, password, email } = result.data

        const passwordHash = await hash(password, 8);

        const userAlreadyExists = await this.usersRepository.findByEmail(email);

        if (userAlreadyExists) {
            throw new AppError("User already exists.");
        }

        await this.usersRepository.create({
            name,
            password: passwordHash,
            email
        });
    }
}

export { CreateUserService };