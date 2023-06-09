import { container } from "tsyringe";
import { IEncryptionProvider } from "./IEncryptionProvider";
import { BcryptProvider } from "./implementations/BcryptProvider";

container.registerSingleton<IEncryptionProvider>(
    "BcryptProvider",
    BcryptProvider
);