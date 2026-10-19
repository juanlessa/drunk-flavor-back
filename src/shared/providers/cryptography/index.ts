import { BcryptHashProvider } from './implementations/BcryptHash.provider';
import { NodeCryptoProvider } from './implementations/NodeCrypto.provider';

const hashProvider = new BcryptHashProvider();
void hashProvider.getDummyHash();
export const resolveHashProvider = () => hashProvider;

const cryptoProvider = new NodeCryptoProvider();
export const resolveCryptoProvider = () => cryptoProvider;
