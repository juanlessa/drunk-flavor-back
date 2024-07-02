import { DatabaseCommonInfo } from "@/shared/infra/mongo/types";

export enum UserRolesEnum {
  admin = "admin",
  partner = "partner",
}

export type UserRole = keyof typeof UserRolesEnum;

export type IUser = DatabaseCommonInfo & {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: UserRole;
};
