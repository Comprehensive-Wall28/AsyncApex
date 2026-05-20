import { SQSEvent, SQSRecord } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { PublishCommand } from '@aws-sdk/client-sns';
import { cloudWatchClient, dynamoDB, TABLES, snsClient } from '../config/aws.config';

type AssignmentMessage = {
  taskId: string;
  taskTitle: string;
  assigneeEmail: string;
  assigneeName?: string;
  teamId: string;
};

function parseSnsOrRawBody(body: string): any {
  const parsed = JSON.parse(body);
  // SNS -> SQS subscription typically wraps the message in an SNS envelope.
  if (parsed && typeof parsed === 'object' && typeof parsed.Message === 'string') {
    return JSON.parse(parsed.Message);
  }
  return parsed;
}

async function processRecord(record: SQSRecord): Promise<void> {
  const msg = parseSnsOrRawBody(record.body) as Partial<AssignmentMessage>;

  if (!msg.taskId || !msg.taskTitle || !msg.assigneeEmail || !msg.teamId) {
    console.warn('Skipping invalid assignment message:', record.body);
    return;
  }

  const timestamp = new Date().toISOString();

  // 1) Activity log entry (audit trail for async processing)
  await dynamoDB.send(
    new PutCommand({
      TableName: TABLES.ActivityLog,
      Item: {
        taskId: msg.taskId,
        timestamp,
        eventType: 'TASK_ASSIGNED',
        teamId: msg.teamId,
        assigneeEmail: msg.assigneeEmail,
        assigneeName: msg.assigneeName,
        taskTitle: msg.taskTitle,
      },
    }),
  );

  // 2) Custom CloudWatch metric
  await cloudWatchClient.send(
    new PutMetricDataCommand({
      Namespace: process.env.CLOUDWATCH_METRICS_NAMESPACE || 'MiniJira',
      MetricData: [
        {
          MetricName: 'TasksAssignedPerTeam',
          Dimensions: [{ Name: 'TeamId', Value: msg.teamId }],
          Timestamp: new Date(timestamp),
          Unit: 'Count',
          Value: 1,
        },
      ],
    }),
  );

  // 3) Email notification to assignee via SNS topic (leveraging existing subscription filter policy)
  const notificationTopicArn = process.env.SNS_DAILY_DIGEST_TOPIC_ARN;
  if (notificationTopicArn && msg.assigneeEmail) {
    try {
      await snsClient.send(
        new PublishCommand({
          TopicArn: notificationTopicArn,
          Subject: `New Task Assigned: ${msg.taskTitle}`,
          Message: `Hello ${msg.assigneeName || 'Team Member'},\n\nYou have been assigned a new task: "${msg.taskTitle}".\n\nTeam: ${msg.teamId}\nTask ID: ${msg.taskId}\n\nLog in to your dashboard to view the details and start working on it!`,
          MessageAttributes: {
            eventType: { DataType: 'String', StringValue: 'TASK_ASSIGNED' },
            email: { DataType: 'String', StringValue: msg.assigneeEmail },
          },
        }),
      );
      console.log(`Successfully sent assignment email to ${msg.assigneeEmail}`);
    } catch (err) {
      console.error(`Failed to send assignment email to ${msg.assigneeEmail}:`, err);
    }
  } else {
    console.warn('Skipping assignment email: SNS_DAILY_DIGEST_TOPIC_ARN not set or assigneeEmail missing');
  }
}

export const handler = async (event: SQSEvent): Promise<void> => {
  const results = await Promise.allSettled(event.Records.map(processRecord));
  const rejected = results.filter((r) => r.status === 'rejected');
  if (rejected.length > 0) {
    // Fail the batch so SQS retries (at-least-once). Make handlers idempotent in prod.
    throw new Error(`Failed to process ${rejected.length}/${results.length} assignment messages`);
  }
};
