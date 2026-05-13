import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';

@ApiTags('Comments')
@ApiBearerAuth('cognito-jwt')
@Controller('comments')
@UseGuards(CognitoAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a task', description: 'Any authenticated user.' })
  @ApiResponse({ status: 201, description: 'Comment created' })
  create(@Body() dto: CreateCommentDto, @Req() req: any) {
    return this.commentsService.create(dto, req.user);
  }

  @Get('by-task/:taskId')
  @ApiOperation({ summary: 'Get all comments for a task', description: 'Any authenticated user.' })
  @ApiParam({ name: 'taskId', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Array of comment objects' })
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment', description: 'Manager or the comment author only.' })
  @ApiParam({ name: 'id', description: 'commentId (UUID)' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not the author or a manager' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.commentsService.remove(id, req.user);
  }
}
