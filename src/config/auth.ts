import * as dotenv from "dotenv";
dotenv.config()

export default {
    secret_token: process.env.TOKEN_SECRET,
    expires_in_token: process.env.TOKEN_EXPIRES_IN,
    expires_token_hours: Number(process.env.TOKEN_EXPIRES_HOURS),
    secret_refresh_token: process.env.REFRESH_TOKEN_SECRET,
    expires_in_refresh_token: process.env.REFRESH_TOKEN_EXPIRES_IN,
    expires_refresh_token_days: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS),
};

