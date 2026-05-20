import { Injectable, Logger } from '@nestjs/common';
import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from '../../config/aws.config';

export interface TaskAssignmentPayload {
  taskId: string;
  taskTitle: string;
  assigneeEmail: string;
  assigneeName: string;
  teamId: string;
  assigneeId: string;
  assignedBy: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async publishTaskAssignment(payload: TaskAssignmentPayload): Promise<void> {
    const topicArn = process.env.SNS_TASK_ASSIGNMENT_TOPIC_ARN;
    if (!topicArn) {
      this.logger.warn('SNS_TASK_ASSIGNMENT_TOPIC_ARN not set — skipping notification');
      return;
    }

    await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Subject: `New Task Assigned: ${payload.taskTitle}`,
        Message: JSON.stringify(payload),
        MessageAttributes: {
          eventType: { DataType: 'String', StringValue: 'TASK_ASSIGNED' },
        },
      }),
    );
  }
}
