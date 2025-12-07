export interface UserModelDTO {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}
