import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/roles.constant';
import { UserRole } from '../enums/user-roles.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
