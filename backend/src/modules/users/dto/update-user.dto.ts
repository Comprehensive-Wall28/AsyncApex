import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['manager', 'employee'])
  role?: 'manager' | 'employee';

  @IsOptional()
  @IsString()
  teamId?: string;
}
