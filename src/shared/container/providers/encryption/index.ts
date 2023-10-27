import { BcryptProvider } from './implementations/Bcrypt.provider';

const encryptionProvider = new BcryptProvider();
export const resolveEncryptionProvider = () => encryptionProvider;
