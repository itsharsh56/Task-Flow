import { UserRole } from 'src/common/enums/user-roles.enum';

export class UserResponseDto {
  id!: number;
  name!: string;
  email!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;
}
