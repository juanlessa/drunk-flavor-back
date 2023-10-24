import { container } from 'tsyringe';
import { IJwtProvider } from './IJwt.provider';
import { JsonwebtokenProvider } from './implementations/Jsonwebtoken.provider';

container.registerSingleton<IJwtProvider>('JwtProvider', JsonwebtokenProvider);
