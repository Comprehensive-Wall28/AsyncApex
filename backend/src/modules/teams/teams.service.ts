import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES } from '../../config/aws.config';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TeamsService {
  async create(dto: CreateTeamDto) {
    const item = {
      teamId: uuidv4(),
      name: dto.name,
      description: dto.description,
      createdAt: new Date().toISOString(),
    };
    await dynamoDB.send(new PutCommand({ TableName: TABLES.Teams, Item: item }));
    return item;
  }

  async findAll() {
    const result = await dynamoDB.send(new ScanCommand({ TableName: TABLES.Teams }));
    return result.Items || [];
  }

  async findOne(teamId: string) {
    const result = await dynamoDB.send(
      new GetCommand({ TableName: TABLES.Teams, Key: { teamId } }),
    );
    if (!result.Item) throw new NotFoundException(`Team ${teamId} not found`);
    return result.Item;
  }

  async update(teamId: string, dto: UpdateTeamDto) {
    await this.findOne(teamId);

    const updates = Object.entries(dto).filter(([, v]) => v !== undefined);
    if (updates.length === 0) return this.findOne(teamId);

    const expression = 'SET ' + updates.map((_, i) => `#u${i} = :u${i}`).join(', ');
    const names = Object.fromEntries(updates.map(([k], i) => [`#u${i}`, k]));
    const values = Object.fromEntries(updates.map(([, v], i) => [`:u${i}`, v]));

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Teams,
        Key: { teamId },
        UpdateExpression: expression,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    );
    return result.Attributes;
  }

  async remove(teamId: string) {
    await this.findOne(teamId);
    await dynamoDB.send(new DeleteCommand({ TableName: TABLES.Teams, Key: { teamId } }));
  }
}
