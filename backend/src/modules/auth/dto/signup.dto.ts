import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsEnum(['manager', 'employee'])
  role: 'manager' | 'employee';

  @IsOptional()
  @IsString()
  teamId?: string;
}
