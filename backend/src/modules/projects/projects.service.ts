import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES } from '../../config/aws.config';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectsService {
  async create(dto: CreateProjectDto, managerId: string) {
    const now = new Date().toISOString();
    const item = {
      projectId: uuidv4(),
      name: dto.name,
      description: dto.description,
      managerId,
      createdAt: now,
      updatedAt: now,
    };
    await dynamoDB.send(new PutCommand({ TableName: TABLES.Projects, Item: item }));
    return item;
  }

  async findAll() {
    const result = await dynamoDB.send(new ScanCommand({ TableName: TABLES.Projects }));
    return result.Items || [];
  }

  async findOne(projectId: string) {
    const result = await dynamoDB.send(
      new GetCommand({ TableName: TABLES.Projects, Key: { projectId } }),
    );
    if (!result.Item) throw new NotFoundException(`Project ${projectId} not found`);
    return result.Item;
  }

  async update(projectId: string, dto: UpdateProjectDto) {
    await this.findOne(projectId);

    const updates = Object.entries({ ...dto, updatedAt: new Date().toISOString() }).filter(
      ([, v]) => v !== undefined,
    );

    const expression = 'SET ' + updates.map((_, i) => `#u${i} = :u${i}`).join(', ');
    const names = Object.fromEntries(updates.map(([k], i) => [`#u${i}`, k]));
    const values = Object.fromEntries(updates.map(([, v], i) => [`:u${i}`, v]));

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Projects,
        Key: { projectId },
        UpdateExpression: expression,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    );
    return result.Attributes;
  }

  async remove(projectId: string) {
    await this.findOne(projectId);
    await dynamoDB.send(new DeleteCommand({ TableName: TABLES.Projects, Key: { projectId } }));
  }
}
