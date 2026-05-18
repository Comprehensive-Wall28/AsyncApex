import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  taskId: string;

  @IsString()
  content: string;
}
