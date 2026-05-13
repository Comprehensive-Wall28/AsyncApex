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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Create a task',
    description: 'Manager only. Publishes an SNS notification to the assignee if `assigneeId` is provided.',
  })
  @ApiResponse({ status: 201, description: 'Task created' })
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(dto, req.user);
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
  @ApiOperation({ summary: "Get tasks for a specific user", description: 'Managers may view any user; employees may view only their own tasks.' })
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

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a task',
    description: 'Managers can update any task. Employees can only update tasks assigned to them. Status changes are written to the ActivityLog table.',
  })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 200, description: 'Updated task object' })
  @ApiResponse({ status: 403, description: 'Not the assignee or not a manager' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: any) {
    return this.tasksService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task', description: 'Manager only.' })
  @ApiParam({ name: 'id', description: 'taskId (UUID)' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.tasksService.remove(id, req.user);
  }
}
