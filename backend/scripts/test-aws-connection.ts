import * as dotenv from 'dotenv';
dotenv.config();

import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { SNSClient, ListTopicsCommand } from '@aws-sdk/client-sns';
import { SQSClient, ListQueuesCommand } from '@aws-sdk/client-sqs';

const region = process.env.AWS_REGION || 'us-east-1';

const checks: Array<{ name: string; fn: () => Promise<string> }> = [
  {
    name: 'DynamoDB — list tables',
    fn: async () => {
      const client = new DynamoDBClient({ region });
      const res = await client.send(new ListTablesCommand({}));
      const tables = res.TableNames || [];
      const required = ['Users', 'Teams', 'Projects', 'Tasks', 'Comments', 'ActivityLog'];
      const missing = required.filter((t) => !tables.includes(t));
      if (missing.length) return `WARN — missing tables: ${missing.join(', ')}`;
      return `OK — found all 6 tables: ${required.join(', ')}`;
    },
  },
  {
    name: 'S3 — list buckets',
    fn: async () => {
      const client = new S3Client({ region });
      const res = await client.send(new ListBucketsCommand({}));
      const buckets = (res.Buckets || []).map((b) => b.Name!);
      const required = [
        process.env.S3_ORIGINALS_BUCKET || 'mini-jira-originals',
        process.env.S3_RESIZED_BUCKET || 'mini-jira-resized',
      ];
      const missing = required.filter((b) => !buckets.includes(b));
      if (missing.length) return `WARN — missing buckets: ${missing.join(', ')}`;
      return `OK — found buckets: ${required.join(', ')}`;
    },
  },
  {
    name: 'SNS — list topics',
    fn: async () => {
      const client = new SNSClient({ region });
      const res = await client.send(new ListTopicsCommand({}));
      const count = (res.Topics || []).length;
      return `OK — ${count} topic(s) visible in ${region}`;
    },
  },
  {
    name: 'SQS — list queues',
    fn: async () => {
      const client = new SQSClient({ region });
      const res = await client.send(new ListQueuesCommand({}));
      const count = (res.QueueUrls || []).length;
      return `OK — ${count} queue(s) visible in ${region}`;
    },
  },
];

async function run() {
  console.log(`\nAWS Connection Test — region: ${region}`);
  console.log('─'.repeat(50));

  let allPassed = true;
  for (const check of checks) {
    try {
      const result = await check.fn();
      const icon = result.startsWith('WARN') ? '⚠' : '✓';
      console.log(`${icon}  ${check.name}\n   ${result}\n`);
      if (result.startsWith('WARN')) allPassed = false;
    } catch (err: any) {
      console.error(`✗  ${check.name}\n   ERROR: ${err.message}\n`);
      allPassed = false;
    }
  }

  console.log('─'.repeat(50));
  console.log(allPassed ? '✓ All checks passed.' : '✗ Some checks failed — fix above before starting the app.');
  process.exit(allPassed ? 0 : 1);
}

run();
