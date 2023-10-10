import { container } from 'tsyringe';
import { IEncryptionProvider } from './IEncryption.provider';
import { BcryptProvider } from './implementations/Bcrypt.provider';

container.registerSingleton<IEncryptionProvider>('BcryptProvider', BcryptProvider);
