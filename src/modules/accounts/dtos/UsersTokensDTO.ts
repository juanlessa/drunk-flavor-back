
interface IUserToken {
    id?: string, 
    user_id: string;
    expires_date: Date;
    refresh_token: string;
}
interface ICreateRefreshToken {
    userEmail: string;
    userId: string;
}
interface ICreateToken {
    userId: string;
}
export { IUserToken, ICreateRefreshToken, ICreateToken };