import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userId: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsEnum(['manager', 'employee'])
  role: 'manager' | 'employee';

  @IsOptional()
  @IsString()
  teamId?: string;
}
