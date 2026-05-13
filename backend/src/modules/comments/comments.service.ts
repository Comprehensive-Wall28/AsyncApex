import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES } from '../../config/aws.config';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { v4 as uuidv4 } from 'uuid';

interface RequestUser {
  userId: string;
  role: string;
}

@Injectable()
export class CommentsService {
  async create(dto: CreateCommentDto, user: RequestUser & { name?: string }) {
    const item = {
      commentId: uuidv4(),
      taskId: dto.taskId,
      authorId: user.userId,
      authorName: user['name'] || user.userId,
      content: dto.content,
      createdAt: new Date().toISOString(),
    };
    await dynamoDB.send(new PutCommand({ TableName: TABLES.Comments, Item: item }));
    return item;
  }

  async findByTask(taskId: string) {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLES.Comments,
        FilterExpression: '#tid = :taskId',
        ExpressionAttributeNames: { '#tid': 'taskId' },
        ExpressionAttributeValues: { ':taskId': taskId },
      }),
    );
    return result.Items || [];
  }

  async update(commentId: string, dto: UpdateCommentDto, user: RequestUser) {
    const result = await dynamoDB.send(
      new GetCommand({ TableName: TABLES.Comments, Key: { commentId } }),
    );
    if (!result.Item) throw new NotFoundException(`Comment ${commentId} not found`);

    const comment = result.Item;
    if (user.role !== 'manager' && comment['authorId'] !== user.userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updated = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.Comments,
        Key: { commentId },
        UpdateExpression: 'SET #content = :content',
        ExpressionAttributeNames: { '#content': 'content' },
        ExpressionAttributeValues: { ':content': dto.content },
        ReturnValues: 'ALL_NEW',
      }),
    );

    return updated.Attributes;
  }

  async remove(commentId: string, user: RequestUser) {
    const result = await dynamoDB.send(
      new GetCommand({ TableName: TABLES.Comments, Key: { commentId } }),
    );
    if (!result.Item) throw new NotFoundException(`Comment ${commentId} not found`);

    const comment = result.Item;
    if (user.role !== 'manager' && comment['authorId'] !== user.userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await dynamoDB.send(
      new DeleteCommand({ TableName: TABLES.Comments, Key: { commentId } }),
    );
  }
}
