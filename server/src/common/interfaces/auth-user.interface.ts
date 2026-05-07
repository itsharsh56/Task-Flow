import { UserRole } from '../enums/user-roles.enum';

export interface AuthUser {
  sub: number;
  email: string;
  role: UserRole;
}
