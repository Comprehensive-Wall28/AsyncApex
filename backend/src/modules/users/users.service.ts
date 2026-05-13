import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES } from '../../config/aws.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  async create(dto: CreateUserDto) {
    const item = { ...dto, isLoggedIn: false, createdAt: new Date().toISOString() };
    await dynamoDB.send(new PutCommand({ TableName: TABLES.Users, Item: item }));
    return item;
  }

  async findAll() {
    const result = await dynamoDB.send(new ScanCommand({ TableName: TABLES.Users }));
    return result.Items || [];
  }

  async findOne(userId: string) {
    const result = await dynamoDB.send(
      new GetCommand({ TableName: TABLES.Users, Key: { userId } }),
    );
    if (!result.Item) throw new NotFoundException(`User ${userId} not found`);
    return result.Item;
  }

  async findByEmail(email: string): Promise<Record<string, any> | null> {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLES.Users,
        FilterExpression: '#email = :email',
        ExpressionAttributeNames: { '#email': 'email' },
        ExpressionAttributeValues: { ':email': email },
      }),
    );
    return result.Items?.[0] ?? null;
  }

  async setLoginStatus(userId: string, isLoggedIn: boolean): Promise<void> {
    await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Users,
        Key: { userId },
        UpdateExpression: 'SET #loggedIn = :loggedIn',
        ExpressionAttributeNames: { '#loggedIn': 'isLoggedIn' },
        ExpressionAttributeValues: { ':loggedIn': isLoggedIn },
      }),
    );
  }

  async update(userId: string, dto: UpdateUserDto) {
    await this.findOne(userId);

    const updates = Object.entries(dto).filter(([, v]) => v !== undefined);
    if (updates.length === 0) return this.findOne(userId);

    const expression = 'SET ' + updates.map((_, i) => `#u${i} = :u${i}`).join(', ');
    const names = Object.fromEntries(updates.map(([k], i) => [`#u${i}`, k]));
    const values = Object.fromEntries(updates.map(([, v], i) => [`:u${i}`, v]));

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Users,
        Key: { userId },
        UpdateExpression: expression,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    );
    return result.Attributes;
  }

  async remove(userId: string) {
    await this.findOne(userId);
    await dynamoDB.send(new DeleteCommand({ TableName: TABLES.Users, Key: { userId } }));
  }
}
