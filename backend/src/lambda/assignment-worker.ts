import { SQSEvent, SQSRecord } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { snsClient } from '../config/aws.config';
import { PublishCommand } from '@aws-sdk/client-sns';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1',
});

async function processRecord(record: SQSRecord): Promise<void> {
  const payload = JSON.parse(record.body) as {
    taskId: string;
    assigneeId: string;
    title: string;
  };

  const userPool = process.env.COGNITO_USER_POOL_ID!;
  const user = await cognitoClient.send(
    new AdminGetUserCommand({ UserPoolId: userPool, Username: payload.assigneeId }),
  );

  const emailAttr = user.UserAttributes?.find((a) => a.Name === 'email');
  const email = emailAttr?.Value;

  if (email && process.env.SNS_TASK_ASSIGNMENT_TOPIC_ARN) {
    await snsClient.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TASK_ASSIGNMENT_TOPIC_ARN,
        Message: `You have been assigned task "${payload.title}" (ID: ${payload.taskId}).`,
        Subject: 'New Task Assignment',
        MessageAttributes: {
          email: { DataType: 'String', StringValue: email },
        },
      }),
    );
    console.log(`Notified ${email} for task ${payload.taskId}`);
  }
}

export const handler = async (event: SQSEvent): Promise<void> => {
  await Promise.all(event.Records.map(processRecord));
};
