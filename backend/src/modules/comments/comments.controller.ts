import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
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
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';

@ApiTags('Comments')
@ApiBearerAuth('cognito-jwt')
@Controller('comments')
@UseGuards(CognitoAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

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
  findByTask(@Param('taskId') taskId: string, @Req() req: any) {
    console.log("GET /comments/by-task/:taskId called with taskId:", taskId);
    return this.commentsService.findByTask(taskId, req.user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a comment', description: 'Manager or the comment author only.' })
  @ApiParam({ name: 'id', description: 'commentId (UUID)' })
  @ApiResponse({ status: 200, description: 'Updated comment object' })
  @ApiResponse({ status: 403, description: 'Not the author or a manager' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCommentDto, @Req() req: any) {
    return this.commentsService.update(id, dto, req.user);
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
