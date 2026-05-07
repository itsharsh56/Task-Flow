import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ProjectMemberRole } from '../../../common/enums/project-member-role.enum';

export class AddProjectMemberDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsOptional()
  @IsEnum(ProjectMemberRole)
  role?: ProjectMemberRole;
}
