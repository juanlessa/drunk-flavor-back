import { container } from "tsyringe";
import { IJwtProvider } from "./IJwtProvider";
import { JsonwebtokenProvider } from "./implementations/JsonwebtokenProvider";

container.registerSingleton<IJwtProvider>(
    "JsonwebtokenProvider",
    JsonwebtokenProvider
);