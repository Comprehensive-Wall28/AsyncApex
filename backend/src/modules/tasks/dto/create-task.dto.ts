import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsString()
  teamId: string;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  imageKey?: string;
}
