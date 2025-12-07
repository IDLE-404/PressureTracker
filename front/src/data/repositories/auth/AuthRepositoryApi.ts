import type { IAuthRepository } from "@/domain/repositories/auth/IAuthRepository";
import type { LoginRequest } from "./request/LoginRequest";
import type { LoginResponse } from "./response/LoginResponse";
import type { UserModelDTO } from "@/data/models/user/UserModel";
import type { UserEntity } from "@/domain/entities/user/UserEntity";
import { mapUserDTOToEntity } from "@/data/mapper/auth/AuthMapper";

export class AuthRepositoryApi implements IAuthRepository {
  private currentUser: UserModelDTO | null = null;

  async checkUser(): Promise<UserEntity | null> {
    if (!this.currentUser) return null;
    return mapUserDTOToEntity(this.currentUser);
  }

  async login(identifier: string, password: string): Promise<UserEntity> {
    const request: LoginRequest = { identifier, password };

    const response: LoginResponse = {
      id: "mock-1",
      username: request.identifier,
      email: `${request.identifier}@mock.com`,
      role: "ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.currentUser = response;
    return mapUserDTOToEntity(response); 
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
}
