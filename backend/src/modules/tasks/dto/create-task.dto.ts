import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'ExactlyOneAssignment', async: false })
class ExactlyOneAssignment implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;

    const hasAssignee = !!obj.assigneeId;
    const hasTeam = !!obj.teamId;

    return hasAssignee !== hasTeam;
  }

  defaultMessage() {
    return 'You must provide either assigneeId or teamId, but not both.';
  }
}

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
  @IsOptional()
  teamId?: string;

  @ApiProperty({ example: 'a1b2c3d4-...', description: 'projectId the task belongs to' })
  @IsString()
  projectId: string;

}
