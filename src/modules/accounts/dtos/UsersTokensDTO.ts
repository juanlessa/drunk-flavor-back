
interface IUserToken {
    id?: string, 
    user_id: string;
    expires_date: Date;
    refresh_token: string;
}
export { IUserToken };