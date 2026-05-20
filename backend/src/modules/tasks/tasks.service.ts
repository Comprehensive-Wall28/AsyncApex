import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES } from '../../config/aws.config';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { S3Service } from '../s3/s3.service';
import { CloudWatchService } from '../cloudwatch/cloudwatch.service';
import { v4 as uuidv4 } from 'uuid';

interface RequestUser {
  userId: string;
  role: string;
  teamId?: string;
}

interface TaskFilters {
  teamId?: string;
  assigneeId?: string;
  status?: string;
  projectId?: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly s3Service: S3Service,
    private readonly cloudWatchService: CloudWatchService,
  ) {}

  async create(dto: CreateTaskDto, user: RequestUser, file?: Express.Multer.File) {
    const hasAssignee = !!dto.assigneeId;
    const hasTeam = !!dto.teamId;

    if (hasAssignee === hasTeam) {
      throw new BadRequestException(
        'You must provide either assigneeId or teamId, but not both.',
      );
    }

    let assignee: Record<string, any> | undefined;

    if (dto.assigneeId) {
      const assigneeResult = await dynamoDB.send(
        new GetCommand({
          TableName: TABLES.Users,
          Key: { userId: dto.assigneeId },
        }),
      );

      if (!assigneeResult.Item) {
        throw new NotFoundException('Assignee not found');
      }

      assignee = assigneeResult.Item;
    }

    if (dto.teamId) {
      const teamResult = await dynamoDB.send(
        new GetCommand({
          TableName: TABLES.Teams,
          Key: { teamId: dto.teamId },
        }),
      );

      if (!teamResult.Item) {
        throw new NotFoundException('Team not found');
      }
    }

    const projectResult = await dynamoDB.send(
      new GetCommand({
        TableName: TABLES.Projects,
        Key: { projectId: dto.projectId },
      }),
    );

    if (!projectResult.Item) {
      throw new NotFoundException('Project not found');
    }

    const taskTeamId = dto.teamId || (assignee ? assignee['teamId'] : undefined);

    let imageKey: string | undefined;

    if (file) {
      const uploaded = await this.s3Service.upload(file);
      imageKey = uploaded.key;
    }

    const now = new Date().toISOString();

    const task = {
      taskId: uuidv4(),
      title: dto.title,
      description: dto.description,
      status: 'todo' as const,
      priority: dto.priority,
      deadline: dto.deadline,
      ...(dto.assigneeId ? { assigneeId: dto.assigneeId } : {}),
      teamId: taskTeamId,
      projectId: dto.projectId,
      ...(imageKey ? { imageKey } : {}),
      createdBy: user.userId,
      createdAt: now,
      updatedAt: now,
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLES.Tasks,
        Item: task,
      }),
    );

    await this.cloudWatchService.publishTaskCreated(taskTeamId);

    if (assignee) {
      try {
        await this.notificationsService.publishTaskAssignment({
          taskId: task.taskId,
          taskTitle: dto.title,
          assigneeEmail: assignee['email'],
          assigneeName: assignee['name'],
          teamId: taskTeamId,
        });
        await this.cloudWatchService.publishTaskAssigned(taskTeamId);
      } catch (err) {
        this.logger.warn(`Failed to send assignment notification: ${err}`);
      }
    }

    return task;
  }

  async findAll(user: RequestUser, filters: TaskFilters) {
    if (user.role !== 'manager') {
      if (!user.teamId) throw new ForbiddenException('User is not assigned to a team');
      return this.queryByIndex('teamId-index', 'teamId', user.teamId, {
        status: filters.status,
        projectId: filters.projectId,
      });
    }

    if (filters.teamId) {
      return this.queryByIndex('teamId-index', 'teamId', filters.teamId, {
        assigneeId: filters.assigneeId,
        status: filters.status,
        projectId: filters.projectId,
      });
    }

    if (filters.assigneeId) {
      return this.queryByIndex('assigneeId-index', 'assigneeId', filters.assigneeId, {
        status: filters.status,
        projectId: filters.projectId,
      });
    }

    return this.scanAll(filters);
  }

  async getTasksByUser(targetUserId: string, requester: RequestUser) {
    if (requester.role !== 'manager' && requester.userId !== targetUserId) {
      throw new ForbiddenException('Access denied to requested user tasks');
    }

    if (requester.role !== 'manager') {
      const assignedToMe = await this.queryByIndex(
        'assigneeId-index',
        'assigneeId',
        targetUserId,
        {},
      );

      if (!requester.teamId) {
        return assignedToMe;
      }

      const assignedToTeam = await this.queryByIndex(
        'teamId-index',
        'teamId',
        requester.teamId,
        {},
      );

      const merged = [...assignedToMe, ...assignedToTeam];
      const seen = new Set();

      return merged.filter((task) => {
        if (seen.has(task.taskId)) return false;
        seen.add(task.taskId);
        return true;
      });
    }

    return this.queryByIndex('assigneeId-index', 'assigneeId', targetUserId, {});
  }

  async findOne(taskId: string, user: RequestUser) {
    const result = await dynamoDB.send(
      new GetCommand({ TableName: TABLES.Tasks, Key: { taskId } }),
    );
    if (!result.Item) throw new NotFoundException(`Task ${taskId} not found`);

    const task = result.Item;
    if (user.role !== 'manager' && task['teamId'] !== user.teamId) {
      throw new ForbiddenException('Access denied to this task');
    }
    return task;
  }

  private async checkHelp(user: RequestUser, taskId: string) {
    const task = await this.findOne(taskId, user);

    const isManager = user.role === 'manager';
    const isAssignedUser = task.assigneeId === user.userId;
    const isInAssignedTeam = task.teamId && user.teamId === task.teamId;
  }

  private isManager(user: RequestUser) {
    return user.role === 'manager';
  }

  private async isAssignedUser(user: RequestUser, taskId: string) {
    const task = await this.findOne(taskId, user);
    return task.assigneeId === user.userId;
  }

  private async isInAssignedTeam(user: RequestUser, taskId: string) {
    const task = await this.findOne(taskId, user);
    return !!task.teamId && user.teamId === task.teamId;
  }

  async update(taskId: string, dto: UpdateTaskDto, user: RequestUser, file?: Express.Multer.File) {
    const task = await this.findOne(taskId, user);

    if (
      !this.isManager(user) &&
      !(await this.isAssignedUser(user, taskId)) &&
      !(await this.isInAssignedTeam(user, taskId))
    ) {
      throw new ForbiddenException(
        'Only the assigned employee, assigned team members, or a manager can update this task',
      );
    }

    const isReassigning = dto.assigneeId !== undefined && dto.assigneeId !== task['assigneeId'];
    if (isReassigning && user.role !== 'manager') {
      throw new ForbiddenException('Only managers can reassign tasks');
    }

    let newAssignee: Record<string, any> | undefined;
    if (isReassigning && dto.assigneeId) {
      const assigneeResult = await dynamoDB.send(
        new GetCommand({ TableName: TABLES.Users, Key: { userId: dto.assigneeId } }),
      );
      if (!assigneeResult.Item) throw new NotFoundException('Assignee not found');
      newAssignee = assigneeResult.Item;

      if (newAssignee['teamId'] !== task['teamId']) {
        throw new BadRequestException('Assignee does not belong to this task team');
      }
    }

    if (dto.status && dto.status !== task['status']) {
      this.validateStatusTransition(task['status'], dto.status, user.role);
    }

    // Handle image replacement (retain the previous image version in S3)
    let newImageKey: string | undefined;
    if (file) {
      const uploaded = await this.s3Service.upload(file);
      newImageKey = uploaded.key;
    }

    const setData: Record<string, any> = {
      ...dto,
      ...(newImageKey ? { imageKey: newImageKey } : {}),
      updatedAt: new Date().toISOString(),
    };
    const setUpdates = Object.entries(setData).filter(([, v]) => v !== undefined);

    const names: Record<string, string> = Object.fromEntries(
      setUpdates.map(([k], i) => [`#u${i}`, k]),
    );
    const values: Record<string, any> = Object.fromEntries(
      setUpdates.map(([, v], i) => [`:u${i}`, v]),
    );

    let expression = 'SET ' + setUpdates.map((_, i) => `#u${i} = :u${i}`).join(', ');


    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Tasks,
        Key: { taskId },
        UpdateExpression: expression,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    );

    if (isReassigning && newAssignee) {
      try {
        await this.notificationsService.publishTaskAssignment({
          taskId,
          taskTitle: result.Attributes?.['title'] || task['title'],
          assigneeEmail: newAssignee['email'],
          assigneeName: newAssignee['name'],
          teamId: task['teamId'],
        });
      } catch (err) {
        this.logger.warn(`Failed to send reassignment notification: ${err}`);
      }
    }

    if (dto.status && dto.status !== task['status']) {
      await this.logStatusChange(taskId, user.userId, task['status'], dto.status);
    }

    return result.Attributes;
  }

  async remove(taskId: string, user: RequestUser) {
    const task = await this.findOne(taskId, user);
    await dynamoDB.send(new DeleteCommand({ TableName: TABLES.Tasks, Key: { taskId } }));

    if (task['imageKey']) {
      try {
        await this.s3Service.remove(task['imageKey']);
      } catch (err) {
        this.logger.warn(`Failed to remove S3 image for deleted task ${taskId}: ${err}`);
      }
    }
  }

  private validateStatusTransition(from: string, to: string, role: string): void {
    if (role === 'manager') return;

    const allowed: Record<string, string> = {
      'todo': 'in-progress',
      'in-progress': 'in-review',
    };

    if (allowed[from] !== to) {
      throw new BadRequestException(
        `Invalid status transition: ${from} → ${to}. Allowed: ${from} → ${allowed[from] ?? 'none'}`,
      );
    }
  }

  private async queryByIndex(
    indexName: string,
    keyName: string,
    keyValue: string,
    extraFilters: Record<string, string | undefined>,
  ) {
    const filterEntries = Object.entries(extraFilters).filter(
      ([, v]) => v !== undefined,
    ) as [string, string][];

    const names: Record<string, string> = { '#pk': keyName };
    const values: Record<string, any> = { ':pk': keyValue };

    let filterExpression: string | undefined;
    if (filterEntries.length > 0) {
      filterEntries.forEach(([k, v], i) => {
        names[`#f${i}`] = k;
        values[`:f${i}`] = v;
      });
      filterExpression = filterEntries.map((_, i) => `#f${i} = :f${i}`).join(' AND ');
    }

    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: TABLES.Tasks,
        IndexName: indexName,
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ...(filterExpression ? { FilterExpression: filterExpression } : {}),
      }),
    );
    return result.Items || [];
  }

  private async scanAll(filters: TaskFilters) {
    const filterEntries = Object.entries(filters).filter(
      ([, v]) => v !== undefined,
    ) as [string, string][];

    if (filterEntries.length === 0) {
      const result = await dynamoDB.send(new ScanCommand({ TableName: TABLES.Tasks }));
      return result.Items || [];
    }

    const names: Record<string, string> = {};
    const values: Record<string, any> = {};
    filterEntries.forEach(([k, v], i) => {
      names[`#f${i}`] = k;
      values[`:f${i}`] = v;
    });
    const filterExpression = filterEntries.map((_, i) => `#f${i} = :f${i}`).join(' AND ');

    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLES.Tasks,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
      }),
    );
    return result.Items || [];
  }

  async startTask(taskId: string, user: RequestUser) {
    const task = await this.findOne(taskId, user);

    if (task['status'] !== 'todo') {
      throw new BadRequestException(`Task status is ${task['status']}, not 'todo'. Cannot start a task that's already in progress.`);
    }

    if (
      !this.isManager(user) &&
      !(await this.isAssignedUser(user, taskId)) &&
      !(await this.isInAssignedTeam(user, taskId))
    ) {
      throw new ForbiddenException(
        'Only the assigned employee, assigned team members, or a manager can start this task',
      );
    }

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Tasks,
        Key: { taskId },
        UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
        ExpressionAttributeValues: { ':status': 'in-progress', ':updatedAt': new Date().toISOString() },
        ReturnValues: 'ALL_NEW',
      }),
    );

    await this.logStatusChange(taskId, user.userId, 'todo', 'in-progress');
    return result.Attributes;
  }

  async submitTask(taskId: string, user: RequestUser) {
    const task = await this.findOne(taskId, user);

    if (task['status'] !== 'in-progress') {
      throw new BadRequestException(`Task status is ${task['status']}, not 'in-progress'. Only in-progress tasks can be submitted for review.`);
    }

    if (
      !this.isManager(user) &&
      !(await this.isAssignedUser(user, taskId)) &&
      !(await this.isInAssignedTeam(user, taskId))
    ) {
      throw new ForbiddenException(
        'Only the assigned employee, assigned team members, or a manager can submit this task for review',
      );
    }

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Tasks,
        Key: { taskId },
        UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
        ExpressionAttributeValues: { ':status': 'in-review', ':updatedAt': new Date().toISOString() },
        ReturnValues: 'ALL_NEW',
      }),
    );

    await this.logStatusChange(taskId, user.userId, 'in-progress', 'in-review');
    return result.Attributes;
  }

  async approveTask(taskId: string, user: RequestUser) {
    if (user.role !== 'manager') {
      throw new ForbiddenException('Only managers can approve tasks');
    }

    console.log(`Approving task ${taskId} by manager ${user.userId}`);

    const task = await this.findOne(taskId, user);

    if (task['status'] !== 'in-review') {
      throw new BadRequestException(`Task status is ${task['status']}, not 'in-review'. Only tasks in review can be approved.`);
    }

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Tasks,
        Key: { taskId },
        UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
        ExpressionAttributeValues: { ':status': 'done', ':updatedAt': new Date().toISOString() },
        ReturnValues: 'ALL_NEW',
      }),
    );

    await this.logStatusChange(taskId, user.userId, 'in-review', 'done');
    if (task['teamId']) {
      await this.cloudWatchService.publishTaskClosed(task['teamId'] as string);
    }
    return result.Attributes;
  }

  async rejectTask(taskId: string, user: RequestUser) {
    if (user.role !== 'manager') {
      throw new ForbiddenException('Only managers can reject tasks');
    }

    const task = await this.findOne(taskId, user);

    if (task['status'] !== 'in-review') {
      throw new BadRequestException(`Task status is ${task['status']}, not 'in-review'. Only tasks in review can be rejected.`);
    }

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Tasks,
        Key: { taskId },
        UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
        ExpressionAttributeValues: { ':status': 'in-progress', ':updatedAt': new Date().toISOString() },
        ReturnValues: 'ALL_NEW',
      }),
    );

    await this.logStatusChange(taskId, user.userId, 'in-review', 'in-progress');
    return result.Attributes;
  }

  async getActivityLogs(taskId: string, user: RequestUser) {
    // Verify task exists and user has access
    await this.findOne(taskId, user);

    let logs: any[] = [];
    try {
      const result = await dynamoDB.send(
        new QueryCommand({
          TableName: TABLES.ActivityLog,
          KeyConditionExpression: '#taskId = :taskId',
          ExpressionAttributeNames: { '#taskId': 'taskId' },
          ExpressionAttributeValues: { ':taskId': taskId },
          ScanIndexForward: false, // Return newest first
        }),
      );
      logs = result.Items || [];
    } catch (err) {
      // Fallback if ActivityLog isn't keyed in a way that supports Query
      const result = await dynamoDB.send(
        new ScanCommand({
          TableName: TABLES.ActivityLog,
          FilterExpression: '#taskId = :taskId',
          ExpressionAttributeNames: { '#taskId': 'taskId' },
          ExpressionAttributeValues: { ':taskId': taskId },
        }),
      );
      logs = result.Items || [];
      // Sort newest first
      logs.sort((a: any, b: any) => String(b.timestamp).localeCompare(String(a.timestamp)));
    }

    // Fetch user details for each log entry to provide names
    const logsWithUserInfo = await Promise.all(
      logs.map(async (log) => {
        try {
          const userResult = await dynamoDB.send(
            new GetCommand({ TableName: TABLES.Users, Key: { userId: log.changedBy } }),
          );
          return {
            ...log,
            userName: userResult.Item ? userResult.Item['name'] : 'Unknown User',
          };
        } catch (err) {
          return { ...log, userName: 'Unknown User' };
        }
      }),
    );

    return logsWithUserInfo;
  }

  private async logStatusChange(
    taskId: string,
    changedBy: string,
    oldStatus: string,
    newStatus: string,
  ) {
    await dynamoDB.send(
      new PutCommand({
        TableName: TABLES.ActivityLog,
        Item: {
          taskId,
          timestamp: new Date().toISOString(),
          eventType: 'STATUS_CHANGED',
          changedBy,
          oldStatus,
          newStatus,
        },
      }),
    );
  }


  async getGlobalStats() {
    const result = await dynamoDB.send(new ScanCommand({ TableName: TABLES.Tasks }));
    const tasks = result.Items || [];

    const totalTasks = tasks.length;
    const closedTasks = tasks.filter((t) => t['status'] === 'done').length;

    // Group tasks by team for time-to-close metrics
    const teamStats: Record<string, { totalClosed: number; totalDuration: number }> = {};

    tasks.forEach((task) => {
      if (task['status'] === 'done' && task['createdAt'] && task['updatedAt']) {
        const start = new Date(task['createdAt']).getTime();
        const end = new Date(task['updatedAt']).getTime();
        const durationHours = (end - start) / (1000 * 60 * 60);

        if (durationHours > 0) {
          const teamId = task['teamId'];
          if (!teamStats[teamId]) {
            teamStats[teamId] = { totalClosed: 0, totalDuration: 0 };
          }
          teamStats[teamId].totalClosed += 1;
          teamStats[teamId].totalDuration += durationHours;
        }
      }
    });

    return {
      totalTasks,
      closedTasks,
      teamStats,
    };
  }
}
