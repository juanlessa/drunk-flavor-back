import { compare, hash } from "bcryptjs";
import { IEncryptionProvider } from "../IEncryption.provider";

class BcryptProvider implements IEncryptionProvider {
  async hash(password: string): Promise<string> {
    const passwordHash = await hash(password, 8);
    return passwordHash;
  }

  async compare(password: string, encryptedPassword: string): Promise<boolean> {
    const passwordMatch = await compare(password, encryptedPassword);
    return passwordMatch;
  }
}

export { BcryptProvider };