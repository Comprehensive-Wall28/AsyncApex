import { SQSEvent, SQSRecord } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { cloudWatchClient, dynamoDB, TABLES } from '../config/aws.config';

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
}

export const handler = async (event: SQSEvent): Promise<void> => {
  const results = await Promise.allSettled(event.Records.map(processRecord));
  const rejected = results.filter((r) => r.status === 'rejected');
  if (rejected.length > 0) {
    // Fail the batch so SQS retries (at-least-once). Make handlers idempotent in prod.
    throw new Error(`Failed to process ${rejected.length}/${results.length} assignment messages`);
  }
};
