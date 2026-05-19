import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('cognito-jwt')
@Controller('tasks')
@UseGuards(CognitoAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a task',
    description:
      'Manager only. Optionally attach an image by including a `file` field in the multipart form — ' +
      'it is uploaded to S3 automatically. Publishes an SNS notification to the assignee.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'priority', 'teamId', 'projectId'],
      properties: {
        title: { type: 'string', example: 'Fix login bug' },
        description: { type: 'string', example: 'Broken on mobile' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        deadline: { type: 'string', example: '2025-12-31T23:59:59.000Z' },
        assigneeId: { type: 'string', example: 'uuid' },
        teamId: { type: 'string', example: 'uuid' },
        projectId: { type: 'string', example: 'uuid' },
        file: { type: 'string', format: 'binary', description: 'Optional image attachment' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Task created' })
  create(
    @Body() dto: CreateTaskDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.tasksService.create(dto, req.user, file);
  }

  @Get()
  @ApiOperation({
    summary: 'List tasks',
    description:
      '**Managers** see all tasks (filterable by any query param).\n\n' +
      '**Employees** are restricted server-side to their own `teamId` — the `teamId` query param is ignored for employees.',
  })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filter by team (manager only — employees are auto-scoped)' })
  @ApiQuery({ name: 'assigneeId', required: false, description: 'Filter by assignee' })
  @ApiQuery({ name: 'status', required: false, enum: ['todo', 'in-progress', 'in-review', 'done'] })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project' })
  @ApiResponse({ status: 200, description: 'Array of task objects' })
  @ApiResponse({ status: 403, description: 'Employee has no teamId assigned' })
  findAll(
    @Req() req: any,
    @Query('teamId') teamId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.tasksService.findAll(req.user, { teamId, assigneeId, status, projectId });
  }

  @Get('by-user/:userId')
  @ApiOperation({
    summary: 'Get tasks for a specific user',
    description:
      'Managers may view any user; employees may view only their own tasks and only within their own team.',
  })
  @ApiParam({ name: 'userId', description: 'userId (UUID) to fetch tasks for' })
  @ApiResponse({ status: 200, description: 'Array of task objects' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getByUser(@Param('userId') userId: string, @Req() req: any) {
    return this.tasksService.getTasksByUser(userId, req.user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a task by ID',
    description: 'Employees get a 403 if the task belongs to a different team.',
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Task object' })
  @ApiResponse({ status: 403, description: 'Task belongs to a different team' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.findOne(id, req.user);
  }

  @Get(':id/logs')
  @ApiOperation({
    summary: 'Get task activity logs',
    description:
      'Returns the audit log for a task. Managers can view any task logs; employees only for tasks in their own team.',
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Array of activity log items' })
  @ApiResponse({ status: 403, description: 'Task belongs to a different team' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  getLogs(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.getActivityLogs(id, req.user);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update a task',
    description:
      'Managers can update any task. Employees can only update tasks assigned to them.\n\n' +
      'Include a `file` field to replace the attached image (the previous version is retained in S3).\n\n' +
      'Task images are deleted only when the task is deleted (not when the status changes).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['todo', 'in-progress', 'in-review', 'done'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        deadline: { type: 'string', example: '2025-12-31T23:59:59.000Z' },
        assigneeId: { type: 'string', example: 'uuid' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Replaces the current image attachment',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Updated task object' })
  @ApiResponse({ status: 403, description: 'Not the assignee or not a manager' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.tasksService.update(id, dto, req.user, file);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a task',
    description:
      'Manager only. If the task has an attached `imageKey`, the image is automatically deleted from S3.',
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.tasksService.remove(id, req.user);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start working on a task',
    description: 'Move task status from `todo` to `in-progress`. Only the assigned employee can start their assigned task (managers can start any task).',
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Task status changed to in-progress' })
  @ApiResponse({ status: 400, description: 'Task is not in todo status' })
  @ApiResponse({ status: 403, description: 'Not the assignee or not a manager' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  startTask(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.startTask(id, req.user);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit task for review',
    description: 'Move task status from `in-progress` to `in-review`. Only the assigned employee can submit their assigned task (managers can submit any task).',
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Task status changed to in-review' })
  @ApiResponse({ status: 400, description: 'Task is not in in-progress status' })
  @ApiResponse({ status: 403, description: 'Not the assignee or not a manager' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  submitTask(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.submitTask(id, req.user);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve task as complete',
    description: 'Manager only. Move task status from `in-review` to `done`.',
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Task status changed to done' })
  @ApiResponse({ status: 400, description: 'Task is not in in-review status' })
  @ApiResponse({ status: 403, description: 'Only managers can approve tasks' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  approveTask(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.approveTask(id, req.user);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject task and return to in-progress',
    description: 'Manager only. Move task status from `in-review` back to `in-progress` for employee to fix.',
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Task status changed to in-progress' })
  @ApiResponse({ status: 400, description: 'Task is not in in-review status' })
  @ApiResponse({ status: 403, description: 'Only managers can reject tasks' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  rejectTask(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.rejectTask(id, req.user);
  }
}
