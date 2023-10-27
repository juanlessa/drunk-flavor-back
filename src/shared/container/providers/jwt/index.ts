import { JsonwebtokenProvider } from './implementations/Jsonwebtoken.provider';

const jwtProvider = new JsonwebtokenProvider();
export const resolveJwtProvider = () => jwtProvider;
