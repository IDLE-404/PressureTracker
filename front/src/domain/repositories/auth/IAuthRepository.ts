import type { UserEntity } from "@/domain/entities/user/UserEntity";

export interface IAuthRepository {
  checkUser(): Promise<UserEntity | null>;
  login(identifier: string, password: string): Promise<UserEntity>;
  logout(): Promise<void>;
  hasRole(role: UserEntity["role"]): boolean;
}
