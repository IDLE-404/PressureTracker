export type UserRole = "ADMIN" | "USER" | "GUEST";

export interface UserEntity {
  id: string;            
  username: string;      
  email: string;       
  role: UserRole;       
  createdAt: Date;      
  updatedAt: Date;    
}
