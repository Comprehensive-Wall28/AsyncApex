import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Fix login bug' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'The login button is broken on mobile' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ['todo', 'in-progress', 'in-review', 'done'],
    description: 'Setting to `done` automatically deletes the attached S3 image.',
  })
  @IsOptional()
  @IsEnum(['todo', 'in-progress', 'in-review', 'done'])
  status?: 'todo' | 'in-progress' | 'in-review' | 'done';

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z', description: 'ISO 8601 deadline' })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-...', description: 'userId of the new assignee' })
  @IsOptional()
  @IsString()
  assigneeId?: string;

}
