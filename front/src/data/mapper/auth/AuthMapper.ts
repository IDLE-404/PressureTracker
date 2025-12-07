import type { UserModelDTO } from "@/data/models/user/UserModel";
import type { UserEntity } from "@/domain/entities/user/UserEntity";

export const mapUserDTOToEntity = (dto: UserModelDTO): UserEntity => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});
