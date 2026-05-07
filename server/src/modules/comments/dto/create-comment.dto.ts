import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCommentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  taskId!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}
