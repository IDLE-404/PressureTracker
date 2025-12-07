import type { UserModelDTO } from "@/data/models/user/UserModel";

export interface LoginResponse extends UserModelDTO {
    token?: string;
}