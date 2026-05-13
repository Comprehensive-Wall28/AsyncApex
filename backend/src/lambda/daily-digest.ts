import { ScheduledEvent } from 'aws-lambda';
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES, snsClient } from '../config/aws.config';
import { PublishCommand } from '@aws-sdk/client-sns';

export const handler = async (_event: ScheduledEvent): Promise<void> => {
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  // Fetch tasks updated in the last 24h via ActivityLog
  const logsResult = await dynamoDB.send(
    new ScanCommand({
      TableName: TABLES.ActivityLog,
      FilterExpression: '#ts >= :since',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
      ExpressionAttributeValues: { ':since': yesterday },
    }),
  );

  const recentLogs = logsResult.Items || [];

  // Fetch all tasks (in production, scope this to the team or use GSI)
  const tasksResult = await dynamoDB.send(new ScanCommand({ TableName: TABLES.Tasks }));
  const tasks = tasksResult.Items || [];

  const byStatus = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const digestMessage = [
    `Daily Digest - ${new Date().toDateString()}`,
    '',
    `Total tasks: ${tasks.length}`,
    ...Object.entries(byStatus).map(([status, count]) => `  ${status}: ${count}`),
    '',
    `Activity in last 24h: ${recentLogs.length} events`,
  ].join('\n');

  if (process.env.SNS_DAILY_DIGEST_TOPIC_ARN) {
    await snsClient.send(
      new PublishCommand({
        TopicArn: process.env.SNS_DAILY_DIGEST_TOPIC_ARN,
        Message: digestMessage,
        Subject: `Mini-Jira Daily Digest - ${new Date().toDateString()}`,
      }),
    );
  }

  console.log('Daily digest sent.');
};
