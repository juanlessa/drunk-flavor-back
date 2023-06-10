
interface IUserToken {
    id?: string, 
    user_id: string;
    expires_date: Date;
    refresh_token: string;
}
interface ICreateRefreshToken {
    userEmail: string;
    userId: string;
    secret: string;
    expiresIn: string;
}
interface ICreateToken {
    userId: string;
    secret: string;
    expiresIn: string;
}
 
interface IVerifyRefreshToken{
    refresh_token: string;
    secret: string
}


interface IPayload {
    sub: string;
    email: string;
}
export { IUserToken, ICreateRefreshToken, ICreateToken, IPayload, IVerifyRefreshToken };