import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Fix login bug' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'The login button is broken on mobile' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'], example: 'medium' })
  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z', description: 'ISO 8601 deadline' })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-...', description: 'userId of the assignee' })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiProperty({ example: 'a1b2c3d4-...', description: 'teamId the task belongs to' })
  @IsString()
  teamId: string;

  @ApiProperty({ example: 'a1b2c3d4-...', description: 'projectId the task belongs to' })
  @IsString()
  projectId: string;

}
