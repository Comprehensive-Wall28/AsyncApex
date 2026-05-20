import { ScheduledEvent } from 'aws-lambda';
import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES, snsClient } from '../config/aws.config';
import { PublishCommand } from '@aws-sdk/client-sns';

export const handler = async (_event: ScheduledEvent): Promise<void> => {
  const topicArn = process.env.SNS_DAILY_DIGEST_TOPIC_ARN;
  if (!topicArn) {
    console.warn('SNS_DAILY_DIGEST_TOPIC_ARN not set — skipping daily digest');
    return;
  }

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const datePrefix = `${y}-${m}-${d}`;

  // Scan tasks due today.
  // For demo scale this is OK; in production, add a GSI on deadlineDate.
  const tasksResult = await dynamoDB.send(
    new ScanCommand({
      TableName: TABLES.Tasks,
      FilterExpression: 'attribute_exists(#deadline) AND begins_with(#deadline, :datePrefix)',
      ExpressionAttributeNames: { '#deadline': 'deadline' },
      ExpressionAttributeValues: { ':datePrefix': datePrefix },
    }),
  );

  const tasks = (tasksResult.Items || []).filter((t: any) => t.assigneeId);
  if (tasks.length === 0) {
    console.log(`No tasks due today (${datePrefix}).`);
    return;
  }

  const byAssignee = tasks.reduce<Record<string, any[]>>((acc, t: any) => {
    acc[t.assigneeId] = acc[t.assigneeId] || [];
    acc[t.assigneeId].push(t);
    return acc;
  }, {});

  for (const [assigneeId, assigneeTasks] of Object.entries(byAssignee)) {
    const userResult = await dynamoDB.send(
      new GetCommand({ TableName: TABLES.Users, Key: { userId: assigneeId } }),
    );
    const user = userResult.Item;
    const email = user?.email;
    const name = user?.name || assigneeId;

    if (!email) {
      console.warn(`No email found for assignee ${assigneeId}; skipping digest`);
      continue;
    }

    const lines = [
      `Daily Digest for ${name} - ${datePrefix}`,
      '',
      `Tasks due today: ${assigneeTasks.length}`,
      ...assigneeTasks.map((t: any) => `- ${t.title} [${t.status}] (priority: ${t.priority}, team: ${t.teamId})`),
    ];

    await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Subject: `Mini-Jira Digest (${datePrefix})`,
        Message: lines.join('\n'),
        MessageAttributes: {
          eventType: { DataType: 'String', StringValue: 'DAILY_DIGEST' },
          email: { DataType: 'String', StringValue: email },
          assigneeId: { DataType: 'String', StringValue: assigneeId },
        },
      }),
    );
  }

  console.log(`Daily digest published for ${Object.keys(byAssignee).length} assignees.`);
};
