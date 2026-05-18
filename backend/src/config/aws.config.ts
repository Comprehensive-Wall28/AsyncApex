import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';

const region = process.env.AWS_REGION || 'us-east-1';

const clientConfig = { region };

const dynamoDBClient = new DynamoDBClient(clientConfig);
export const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: { removeUndefinedValues: true },
});

export const s3Client = new S3Client(clientConfig);
export const snsClient = new SNSClient(clientConfig);
export const sqsClient = new SQSClient(clientConfig);
export const cloudWatchClient = new CloudWatchClient(clientConfig);

export const TABLES = {
  Users: process.env.DYNAMODB_USERS_TABLE || 'Users',
  Teams: process.env.DYNAMODB_TEAMS_TABLE || 'Teams',
  Projects: process.env.DYNAMODB_PROJECTS_TABLE || 'Projects',
  Tasks: process.env.DYNAMODB_TASKS_TABLE || 'Tasks',
  Comments: process.env.DYNAMODB_COMMENTS_TABLE || 'Comments',
  ActivityLog: process.env.DYNAMODB_ACTIVITY_LOG_TABLE || 'ActivityLog',
};

export const BUCKETS = {
  originals: process.env.S3_ORIGINALS_BUCKET || 'mini-jira-originals',
  resized: process.env.S3_RESIZED_BUCKET || 'mini-jira-resized',
};
